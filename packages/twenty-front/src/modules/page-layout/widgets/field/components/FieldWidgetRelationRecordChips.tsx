import { RecordChip } from '@/object-record/components/RecordChip';
import { type FieldWidgetRelationRecord } from '@/page-layout/widgets/field/types/FieldWidgetRelationRecord';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  box-sizing: border-box;
  padding: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledRelationChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

type FieldWidgetRelationRecordChipsProps = {
  relationRecords: FieldWidgetRelationRecord[];
  isInSidePanel: boolean;
};

export const FieldWidgetRelationRecordChips = ({
  relationRecords,
  isInSidePanel,
}: FieldWidgetRelationRecordChipsProps) => {
  if (relationRecords.length === 0) {
    return null;
  }

  return (
    <SidePanelProvider value={{ isInSidePanel }}>
      <StyledContainer>
        <StyledRelationChipsContainer>
          {relationRecords.map(({ record, objectNameSingular }) => (
            <RecordChip
              key={`${objectNameSingular}-${record.id}`}
              objectNameSingular={objectNameSingular}
              record={record}
            />
          ))}
        </StyledRelationChipsContainer>
      </StyledContainer>
    </SidePanelProvider>
  );
};
