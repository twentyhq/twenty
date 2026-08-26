import { RecordIdentifierBarTitle } from '@/object-record/record-show/components/RecordIdentifierBarTitle';
import { useOpenPageLayoutTabSettings } from '@/page-layout/hooks/useOpenPageLayoutTabSettings';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH } from '@/page-layout/constants/PageLayoutLeftPanelContainerWidth';
import { PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT } from '@/page-layout/constants/PageLayoutRecordIdentifierBarHeight';
import { PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_SIDE_MIN_WIDTH } from '@/page-layout/constants/PageLayoutRecordIdentifierBarSideMinWidth';
import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { TAB_LIST_ROW_HEIGHT_CSS_VARIABLE } from '@/ui/layout/tab-list/constants/TabListRowHeightCssVariable';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconPinned } from 'twenty-ui/icon';
import { TabButton } from 'twenty-ui/input';
import { AppTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';

export const PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_TAB_LIST_CLASS_NAME =
  'page-layout-record-identifier-bar-tab-list';

const SIDE_TRACK = `minmax(${PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_SIDE_MIN_WIDTH}px, max-content)`;

// The side tracks hug their own text and the tabs track takes everything left
// between them. Sizing the tabs from the leftover rather than from their own
// content is what lets the strip grow back once the window widens, and it
// leaves the two sides equal, so the strip centers on the page, whenever their
// text is of similar length.
const StyledBar = styled.div<{ hasPinnedTab: boolean }>`
  align-items: stretch;
  background: ${themeCssVariables.background.secondary};
  // The bottom line sits inside the box so the tab strip can fill the whole row
  // and land its active indicator on that line rather than above it.
  box-shadow: inset 0 -1px 0 ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: grid;
  grid-template-columns: ${({ hasPinnedTab }) =>
    hasPinnedTab
      ? `${PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH}px minmax(0, 1fr) auto`
      : `${SIDE_TRACK} minmax(0, 1fr) ${SIDE_TRACK}`};
  height: ${PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT}px;
  width: 100%;
`;

const StyledIdentifierCell = styled.div<{ hasPinnedTab: boolean }>`
  align-items: center;
  justify-content: space-between;
  border-right: ${({ hasPinnedTab }) =>
    hasPinnedTab
      ? `1px solid ${themeCssVariables.border.color.medium}`
      : 'none'};
  box-sizing: border-box;
  display: flex;
  // Unpinned, the cell grows with the record name, up to the width it would
  // have had as a pinned column so a long name cannot crowd out the tabs.
  max-width: ${({ hasPinnedTab }) =>
    hasPinnedTab ? 'none' : `${PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH}px`};
  min-width: 0;
  padding-left: ${themeCssVariables.spacing[3]};
  padding-right: ${themeCssVariables.spacing[2]};
`;

// The chip sits at the end of the identifier cell, over the column it pins.
const StyledPinnedTab = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: 100%;
  margin-left: ${themeCssVariables.spacing[2]};
`;

const StyledTabsCell = styled.div<{ hasPinnedTab: boolean }>`
  align-items: stretch;
  display: flex;
  min-width: 0;

  // The tab list decides how many tabs to show from the width its own wrapper
  // reports, so that wrapper has to fill the track rather than shrink-wrap the
  // tabs it is measuring.
  > div {
    flex: 1;
    min-width: 0;
  }

  // The bar already draws the row's bottom line, so the strip drops its own and
  // fills the row instead. Buttons the dropdown wraps in a fit-content box read
  // their height from the variable.
  .${PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_TAB_LIST_CLASS_NAME} {
    ${TAB_LIST_ROW_HEIGHT_CSS_VARIABLE}: ${PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT}px;
    height: 100%;
    // Without a pinned tab the strip fills the track it is centered in, so its
    // own content carries the centering.
    justify-content: ${({ hasPinnedTab }) =>
      hasPinnedTab ? 'flex-start' : 'center'};
    padding-right: ${themeCssVariables.spacing[2]};

    &::after {
      display: none;
    }
  }

  @media print {
    display: none;
  }
`;

const StyledCreatedAtCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  justify-content: flex-end;
  padding-left: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[3]};
  white-space: nowrap;
`;

const StyledCreatedAt = styled.span`
  cursor: pointer;
`;

type PageLayoutRecordIdentifierBarProps = {
  targetRecordIdentifier: TargetRecordIdentifier;
  hasPinnedTab: boolean;
  pinnedTabToEdit?: PageLayoutTab;
  tabList?: ReactNode;
};

export const PageLayoutRecordIdentifierBar = ({
  targetRecordIdentifier,
  hasPinnedTab,
  pinnedTabToEdit,
  tabList,
}: PageLayoutRecordIdentifierBarProps) => {
  const { t } = useLingui();
  const { openTabSettings } = useOpenPageLayoutTabSettings();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const recordCreatedAt = useAtomFamilySelectorValue(
    recordStoreFamilySelector,
    {
      recordId: targetRecordIdentifier.id,
      fieldName: 'createdAt',
    },
  ) as string | null;

  const instanceId = useId();
  const createdAtElementId = `record-identifier-bar-created-at-${instanceId.replace(/[^a-zA-Z0-9-_]/g, '-')}`;

  const hasCreatedAt = isNonEmptyString(recordCreatedAt);

  return (
    <StyledBar hasPinnedTab={hasPinnedTab}>
      <StyledIdentifierCell hasPinnedTab={hasPinnedTab}>
        <RecordIdentifierBarTitle
          objectNameSingular={targetRecordIdentifier.targetObjectNameSingular}
          objectRecordId={targetRecordIdentifier.id}
        />

        {isDefined(pinnedTabToEdit) && (
          <StyledPinnedTab>
            <TabButton
              id={pinnedTabToEdit.id}
              title={pinnedTabToEdit.title}
              LeftIcon={IconPinned}
              onClick={() => openTabSettings(pinnedTabToEdit.id)}
              tooltipContent={t`Pinned tab, always shown on the left`}
              disableTestId
            />
          </StyledPinnedTab>
        )}
      </StyledIdentifierCell>

      <StyledTabsCell hasPinnedTab={hasPinnedTab}>{tabList}</StyledTabsCell>

      <StyledCreatedAtCell>
        {hasCreatedAt && (
          <>
            <StyledCreatedAt id={createdAtElementId}>
              {beautifyPastDateRelativeToNow(recordCreatedAt, localeCatalog)}
            </StyledCreatedAt>
            <AppTooltip
              anchorSelect={`#${createdAtElementId}`}
              content={beautifyExactDateTime(recordCreatedAt)}
              clickable
              noArrow
              place="left"
            />
          </>
        )}
      </StyledCreatedAtCell>
    </StyledBar>
  );
};
