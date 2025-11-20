import { usePageLayoutHeaderInfo } from '@/command-menu/components/hooks/usePageLayoutHeaderInfo';
import { useUpdateCommandMenuPageInfo } from '@/command-menu/hooks/useUpdateCommandMenuPageInfo';
import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useUpdatePageLayoutTab } from '@/page-layout/hooks/useUpdatePageLayoutTab';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

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

  const headerInfo = usePageLayoutHeaderInfo({
    commandMenuPage,
    draftPageLayout,
    pageLayoutEditingWidgetId,
    openTabId,
    editedTitle,
  });

  if (!headerInfo) {
    return null;
  }

  const {
    headerIcon,
    headerIconColor,
    headerType,
    title,
    isReadonly,
    tab,
    widgetInEditMode,
  } = headerInfo;

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
      updatePageLayoutTab(tab.id, { title: finalTitle });
    } else if (isDefined(widgetInEditMode)) {
      updatePageLayoutWidget(widgetInEditMode.id, {
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
