import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import { GRAPH_TYPE_INFORMATION } from '@/command-menu/pages/page-layout/constants/GraphTypeInformation';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { isChartWidget } from '@/command-menu/pages/page-layout/utils/isChartWidget';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useUpdatePageLayoutTab } from '@/page-layout/hooks/useUpdatePageLayoutTab';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  IconAppWindow,
  IconFrame,
  useIcons,
  type IconComponent,
} from 'twenty-ui/display';
import { type PageLayoutWidget } from '~/generated/graphql';

const StyledPageLayoutInfoContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledPageLayoutIcon = styled.div<{ iconColor: string }>`
  align-items: center;
  background: ${({ theme }) => theme.background.transparent.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ iconColor }) => iconColor};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledPageLayoutTitleContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  min-width: 0;
`;

const StyledPageLayoutType = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  white-space: nowrap;
`;

export const CommandMenuPageLayoutInfo = () => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const commandMenuPage = useRecoilValue(commandMenuPageState);
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const draftPageLayout = useRecoilComponentValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetId = useRecoilComponentValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const [openTabId] = useRecoilComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
    pageLayoutId,
  );

  const { updateCommandMenuPageInfo } = useUpdateCommandMenuPageInfo();
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);
  const { updatePageLayoutTab } = useUpdatePageLayoutTab(pageLayoutId);

  const [editedTitle, setEditedTitle] = useState<string | null>(null);

  let widgetInEditMode: PageLayoutWidget | undefined;
  let tab: PageLayoutTab | undefined;
  let headerIcon: IconComponent | undefined;
  let headerIconColor: string;
  let headerType: string;
  let title: string;
  let isReadonly: boolean;

  if (commandMenuPage === CommandMenuPages.PageLayoutTabSettings) {
    if (!isDefined(openTabId)) {
      return null;
    }

    tab = draftPageLayout.tabs.find((t) => t.id === openTabId);
    if (!isDefined(tab)) {
      return null;
    }

    headerIcon = IconAppWindow;
    headerIconColor = theme.font.color.tertiary;
    headerType = t`Tab`;
    title =
      editedTitle ??
      (isDefined(tab.title) && tab.title !== '' ? tab.title : '');
    isReadonly = false;
  } else {
    if (!isDefined(pageLayoutEditingWidgetId)) {
      return null;
    }

    widgetInEditMode = draftPageLayout.tabs
      .flatMap((tab) => tab.widgets)
      .find((widget) => widget.id === pageLayoutEditingWidgetId);

    if (!isDefined(widgetInEditMode)) {
      return null;
    }

    if (commandMenuPage === CommandMenuPages.PageLayoutIframeSettings) {
      headerIcon = IconFrame;
      headerIconColor = theme.font.color.tertiary;
      headerType = t`iFrame Widget`;
      title =
        editedTitle ??
        (isDefined(widgetInEditMode.title) && widgetInEditMode.title !== ''
          ? widgetInEditMode.title
          : '');
      isReadonly = false;
    } else if (
      commandMenuPage === CommandMenuPages.PageLayoutGraphTypeSelect ||
      commandMenuPage === CommandMenuPages.PageLayoutGraphFilter
    ) {
      if (!isChartWidget(widgetInEditMode)) {
        return null;
      }

      const currentGraphType = widgetInEditMode.configuration.graphType;
      const graphTypeInfo = GRAPH_TYPE_INFORMATION[currentGraphType];
      const graphTypeLabel = t(graphTypeInfo.label);

      headerIcon = graphTypeInfo.icon;
      headerIconColor = theme.font.color.tertiary;
      headerType =
        commandMenuPage === CommandMenuPages.PageLayoutGraphFilter
          ? t`${graphTypeLabel} Chart`
          : t`Chart`;
      title =
        editedTitle ??
        (isDefined(widgetInEditMode.title) && widgetInEditMode.title !== ''
          ? widgetInEditMode.title
          : '');
      isReadonly = commandMenuPage === CommandMenuPages.PageLayoutGraphFilter;
    } else {
      return null;
    }
  }

  const Icon = headerIcon ?? getIcon('IconDefault');

  const handleTitleChange = (newTitle: string) => {
    setEditedTitle(newTitle);
  };

  const saveTitle = async () => {
    const finalTitle = editedTitle ?? title;

    if (!isNonEmptyString(finalTitle)) {
      return;
    }

    updateCommandMenuPageInfo({
      pageTitle: finalTitle,
      pageIcon: Icon,
    });

    if (
      commandMenuPage === CommandMenuPages.PageLayoutTabSettings &&
      isDefined(tab)
    ) {
      await updatePageLayoutTab(tab.id, { title: finalTitle });
    } else if (isDefined(widgetInEditMode)) {
      await updatePageLayoutWidget(widgetInEditMode.id, {
        title: finalTitle,
      });
    }

    setEditedTitle(null);
  };

  return (
    <StyledPageLayoutInfoContainer>
      {isDefined(headerIcon) && (
        <StyledPageLayoutIcon iconColor={headerIconColor}>
          <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        </StyledPageLayoutIcon>
      )}
      <StyledPageLayoutTitleContainer>
        <TitleInput
          instanceId={`page-layout-title-${commandMenuPage}-${pageLayoutId}`}
          disabled={isReadonly}
          sizeVariant="sm"
          value={title}
          onChange={handleTitleChange}
          placeholder={headerType}
          onEnter={saveTitle}
          onEscape={() => setEditedTitle(null)}
          onClickOutside={saveTitle}
          onTab={saveTitle}
          onShiftTab={saveTitle}
        />
      </StyledPageLayoutTitleContainer>
      {headerType && <StyledPageLayoutType>{headerType}</StyledPageLayoutType>}
    </StyledPageLayoutInfoContainer>
  );
};
