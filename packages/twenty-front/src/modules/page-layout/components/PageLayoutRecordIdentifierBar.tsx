import { RecordIdentifierBarTitle } from '@/object-record/record-show/components/RecordIdentifierBarTitle';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH } from '@/page-layout/constants/PageLayoutLeftPanelContainerWidth';
import { PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_HEIGHT } from '@/page-layout/constants/PageLayoutRecordIdentifierBarHeight';
import { PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_SIDE_MIN_WIDTH } from '@/page-layout/constants/PageLayoutRecordIdentifierBarSideMinWidth';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useId, type ReactNode } from 'react';
import { AppTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import {
  beautifyExactDateTime,
  beautifyPastDateRelativeToNow,
} from '~/utils/date-utils';

export const PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_TAB_LIST_CLASS_NAME =
  'page-layout-record-identifier-bar-tab-list';

// Both side tracks are 1fr so they stay equal, which is what puts the tabs at
// the center of the page. The tabs track has a 0 minimum so it yields space to
// them instead of overflowing, letting the tab list collapse into its more
// dropdown; the created-at track never shrinks below its own text.
const StyledBar = styled.div<{ hasPinnedTab: boolean }>`
  align-items: stretch;
  background: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: grid;
  grid-template-columns: ${({ hasPinnedTab }) =>
    hasPinnedTab
      ? `${PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH}px minmax(0, 1fr) auto`
      : `minmax(${PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_SIDE_MIN_WIDTH}px, 1fr) minmax(0, auto) minmax(max-content, 1fr)`};
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
  min-width: 0;
  padding-left: ${themeCssVariables.spacing[3]};
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledTabsCell = styled.div`
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

  // The bar already draws the row's bottom border, so the strip drops its own
  // and grows over that border instead, keeping the active tab indicator on it.
  .${PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_TAB_LIST_CLASS_NAME} {
    height: calc(100% + 1px);
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
  tabList?: ReactNode;
};

export const PageLayoutRecordIdentifierBar = ({
  targetRecordIdentifier,
  hasPinnedTab,
  tabList,
}: PageLayoutRecordIdentifierBarProps) => {
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
      </StyledIdentifierCell>

      <StyledTabsCell>{tabList}</StyledTabsCell>

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
