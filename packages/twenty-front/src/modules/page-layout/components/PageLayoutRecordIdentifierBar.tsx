import { RecordIdentifierBarCreatedAt } from '@/object-record/record-show/components/RecordIdentifierBarCreatedAt';
import { RecordIdentifierBarTitle } from '@/object-record/record-show/components/RecordIdentifierBarTitle';
import { PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH } from '@/page-layout/constants/PageLayoutLeftPanelContainerWidth';
import { PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT } from '@/page-layout/constants/PageLayoutRecordIdentifierBarHeight';
import { useOpenPageLayoutTabSettings } from '@/page-layout/hooks/useOpenPageLayoutTabSettings';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPinned } from 'twenty-ui/icon';
import { IconButtonWithTooltip } from 'twenty-ui/input';
import { TooltipDelay } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const SIDE_TRACK = `min(${PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH}px, calc(100% / 3))`;

// Equal side tracks center the tabs independently of the record name. Their
// width stays independent of visible tabs so overflow can recover on resize.
const StyledBar = styled.div<{
  hasPinnedTab: boolean;
  hasTabList: boolean;
}>`
  align-items: stretch;
  background: ${themeCssVariables.background.secondary};
  // The bottom line sits inside the box so the tab strip can fill the whole row
  // and land its active indicator on that line rather than above it.
  box-shadow: inset 0 -1px 0 ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: grid;
  grid-template-columns: ${({ hasPinnedTab, hasTabList }) =>
    hasPinnedTab
      ? `${PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH}px minmax(0, 1fr)`
      : hasTabList
        ? `${SIDE_TRACK} minmax(0, 1fr) ${SIDE_TRACK}`
        : 'minmax(0, 1fr) auto'};
  height: ${PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT}px;
  width: 100%;
`;

const StyledIdentifierCell = styled.div<{ hasPinnedTab: boolean }>`
  align-items: center;
  border-right: ${({ hasPinnedTab }) =>
    hasPinnedTab
      ? `1px solid ${themeCssVariables.border.color.medium}`
      : 'none'};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-width: 0;
  padding-left: ${themeCssVariables.spacing[3]};
  padding-right: ${themeCssVariables.spacing[2]};
`;

// The pinned-tab control stays over the left panel when editing.
const StyledPinnedTab = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: 100%;
`;

const StyledTabsCell = styled.div`
  align-items: stretch;
  display: flex;
  min-width: 0;

  @media print {
    display: none;
  }
`;

const StyledCreatedAtCell = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  min-width: 0;
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[3]};
`;

type PageLayoutRecordIdentifierBarProps = {
  targetRecordIdentifier: TargetRecordIdentifier;
  pinnedTab?: Pick<PageLayoutTab, 'id' | 'title'>;
  isPinnedTabEditable?: boolean;
  tabList?: ReactNode;
};

export const PageLayoutRecordIdentifierBar = ({
  targetRecordIdentifier,
  pinnedTab,
  isPinnedTabEditable = false,
  tabList,
}: PageLayoutRecordIdentifierBarProps) => {
  const { t } = useLingui();
  const { openTabSettings } = useOpenPageLayoutTabSettings();
  const hasPinnedTab = isDefined(pinnedTab);
  const hasTabList = Boolean(tabList);
  const createdAt = (
    <RecordIdentifierBarCreatedAt objectRecordId={targetRecordIdentifier.id} />
  );

  return (
    <StyledBar hasPinnedTab={hasPinnedTab} hasTabList={hasTabList}>
      <StyledIdentifierCell hasPinnedTab={hasPinnedTab}>
        <RecordIdentifierBarTitle
          objectNameSingular={targetRecordIdentifier.targetObjectNameSingular}
          objectRecordId={targetRecordIdentifier.id}
        />

        {isPinnedTabEditable && isDefined(pinnedTab) && (
          <StyledPinnedTab>
            <IconButtonWithTooltip
              Icon={IconPinned}
              ariaLabel={t`Edit pinned tab: ${pinnedTab.title}`}
              onClick={() => openTabSettings(pinnedTab.id)}
              tooltipContent={t`Pinned tab, always shown on the left`}
              tooltipDelay={TooltipDelay.shortDelay}
              size="small"
              variant="tertiary"
            />
          </StyledPinnedTab>
        )}
      </StyledIdentifierCell>

      {(hasPinnedTab || hasTabList) && (
        <StyledTabsCell>{tabList}</StyledTabsCell>
      )}

      {!hasPinnedTab && <StyledCreatedAtCell>{createdAt}</StyledCreatedAtCell>}
    </StyledBar>
  );
};
