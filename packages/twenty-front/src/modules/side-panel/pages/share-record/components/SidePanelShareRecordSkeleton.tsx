import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Skeleton } from 'twenty-ui/primitives/feedback';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

import { SidePanelShareRecordGroup } from '@/side-panel/pages/share-record/components/SidePanelShareRecordGroup';
import { SidePanelShareRecordList } from '@/side-panel/pages/share-record/components/SidePanelShareRecordList';

const SKELETON_GROUPS = [
  {
    id: 'everyone',
    headingWidth: themeCssVariables.spacing[14],
    rowWidths: [themeCssVariables.spacing[32]],
  },
  {
    id: 'roles',
    headingWidth: themeCssVariables.spacing[8],
    rowWidths: [themeCssVariables.spacing[20]],
  },
  {
    id: 'users',
    headingWidth: themeCssVariables.spacing[8],
    rowWidths: [themeCssVariables.spacing[24], themeCssVariables.spacing[28]],
  },
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
`;

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[10]};
  justify-content: space-between;
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledListContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

export const SidePanelShareRecordSkeleton = () => {
  const { t } = useLingui();

  return (
    <StyledContainer
      role="status"
      aria-label={t`Loading sharing settings`}
      aria-busy
    >
      <StyledHeader aria-hidden>
        <Skeleton width="50%" height={themeCssVariables.spacing[3]} />
        <Skeleton
          width={themeCssVariables.spacing[13]}
          height={themeCssVariables.spacing[6]}
        />
      </StyledHeader>
      <StyledListContainer aria-hidden>
        <SidePanelShareRecordList>
          {SKELETON_GROUPS.map(({ id, headingWidth, rowWidths }) => (
            <SidePanelShareRecordGroup
              key={id}
              heading={
                <Skeleton
                  width={headingWidth}
                  height={themeCssVariables.spacing[2]}
                />
              }
            >
              {rowWidths.map((width) => (
                <ListItem
                  key={width}
                  disabled
                  startIcon={
                    <Skeleton
                      width={themeCssVariables.spacing[6]}
                      height={themeCssVariables.spacing[6]}
                    />
                  }
                  description={
                    <Skeleton
                      width={themeCssVariables.spacing[10]}
                      height={themeCssVariables.spacing[3]}
                    />
                  }
                  descriptionPlacement="end"
                >
                  <Skeleton
                    width={width}
                    height={themeCssVariables.spacing[3]}
                  />
                </ListItem>
              ))}
            </SidePanelShareRecordGroup>
          ))}
        </SidePanelShareRecordList>
      </StyledListContainer>
    </StyledContainer>
  );
};
