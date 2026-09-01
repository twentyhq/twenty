import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordChip } from '@/object-record/components/RecordChip';
import { extractTargetRecordsFromJunction } from '@/object-record/record-field/ui/utils/junction/extractTargetRecordsFromJunction';
import { type ValidResolvedJunctionConfig } from '@/object-record/record-field/ui/utils/junction/types/ValidResolvedJunctionConfig';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
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

type FieldWidgetJunctionRelationFieldProps = {
  relationValue: any;
  isInSidePanel: boolean;
  junctionConfig: ValidResolvedJunctionConfig;
};

export const FieldWidgetJunctionRelationField = ({
  relationValue,
  isInSidePanel,
  junctionConfig,
}: FieldWidgetJunctionRelationFieldProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const junctionRecords = Array.isArray(relationValue) ? relationValue : [];

  const extractedRecords = extractTargetRecordsFromJunction({
    junctionRecords,
    targetFields: junctionConfig.targetFields,
    objectMetadataItems,
    includeRecord: true,
  });

  const targetRecordsWithMetadata = extractedRecords
    .map((extracted) => {
      const objectMetadata = objectMetadataItems.find(
        (item) => item.id === extracted.objectMetadataId,
      );
      if (!objectMetadata || !extracted.record) {
        return null;
      }
      return { record: extracted.record, objectMetadata };
    })
    .filter(isDefined);

  if (targetRecordsWithMetadata.length === 0) {
    return null;
  }

  return (
    <SidePanelProvider value={{ isInSidePanel }}>
      <StyledContainer>
        <StyledRelationChipsContainer>
          {targetRecordsWithMetadata.map(({ record, objectMetadata }) => (
            <RecordChip
              key={record.id}
              objectNameSingular={objectMetadata.nameSingular}
              record={record}
            />
          ))}
        </StyledRelationChipsContainer>
      </StyledContainer>
    </SidePanelProvider>
  );
};
