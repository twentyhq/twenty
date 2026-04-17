import { useUpdatePageLayoutTab } from '@/page-layout/hooks/useUpdatePageLayoutTab';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { usePageLayoutHeaderInfo } from '@/side-panel/components/hooks/usePageLayoutHeaderInfo';
import { useUpdateSidePanelPageInfo } from '@/side-panel/hooks/useUpdateSidePanelPageInfo';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { sidePanelShouldFocusTitleInputComponentState } from '@/side-panel/states/sidePanelShouldFocusTitleInputComponentState';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext, useState } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { SidePanelPageInfoLayout } from './SidePanelPageInfoLayout';

const StyledClickableIconWrapper = styled.div`
  cursor: pointer;
  display: flex;
  line-height: 0;
`;

const iconPickerContainerStyles = css`
  display: flex;
  line-height: 0;
`;

export const SidePanelPageLayoutInfoContent = ({
  pageLayoutId,
}: {
  pageLayoutId: string;
}) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const sidePanelPageInfo = useAtomStateValue(sidePanelPageInfoState);

  const [sidePanelShouldFocusTitleInput, setSidePanelShouldFocusTitleInput] =
    useAtomComponentState(
      sidePanelShouldFocusTitleInputComponentState,
      sidePanelPageInfo.instanceId,
    );

  const handleTitleInputOpen = () => {
    setSidePanelShouldFocusTitleInput(false);
  };

  const pageLayoutDraft = useAtomComponentStateValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetId = useAtomComponentStateValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const [pageLayoutTabSettingsOpenTabId] = useAtomComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
    pageLayoutId,
  );

  const { updateSidePanelPageInfo } = useUpdateSidePanelPageInfo();
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);
  const { updatePageLayoutTab } = useUpdatePageLayoutTab(pageLayoutId);

  const [editedTitle, setEditedTitle] = useState<string | null>(null);

  const headerInfo = usePageLayoutHeaderInfo({
    sidePanelPage,
    draftPageLayout: pageLayoutDraft,
    pageLayoutEditingWidgetId,
    openTabId: pageLayoutTabSettingsOpenTabId,
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
    isIconEditable,
    selectedIconKey,
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

    updateSidePanelPageInfo({
      pageTitle: finalTitle,
      pageIcon: Icon,
    });

    if (
      sidePanelPage === SidePanelPages.PageLayoutTabSettings &&
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

  const renderedIcon = isDefined(headerIcon) ? (
    <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
  ) : undefined;

  const handleIconChange = ({ iconKey }: { iconKey: string }) => {
    if (!isDefined(tab)) {
      return;
    }

    updatePageLayoutTab(tab.id, { icon: iconKey });
  };

  const iconElement =
    isIconEditable && isDefined(tab) ? (
      <IconPicker
        dropdownId={`page-layout-tab-icon-picker-${tab.id}`}
        selectedIconKey={selectedIconKey ?? undefined}
        onChange={handleIconChange}
        className={iconPickerContainerStyles}
        clickableComponent={
          <StyledClickableIconWrapper>
            {renderedIcon}
          </StyledClickableIconWrapper>
        }
      />
    ) : (
      renderedIcon
    );

  return (
    <SidePanelPageInfoLayout
      icon={iconElement}
      iconColor={headerIconColor}
      title={
        <TitleInput
          instanceId={`page-layout-title-${sidePanelPage}-${pageLayoutId}`}
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
          shouldFocus={sidePanelShouldFocusTitleInput}
          onFocus={handleTitleInputOpen}
        />
      }
      label={headerType}
    />
  );
};
