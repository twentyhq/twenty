import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsObjectRelatedRecordPathAddDropdown } from '@/related-record-paths/components/SettingsObjectRelatedRecordPathAddDropdown';
import { SettingsObjectRelatedRecordPathTableRow } from '@/related-record-paths/components/SettingsObjectRelatedRecordPathTableRow';
import { RELATED_RECORD_PATH_TABLE_GRID_TEMPLATE_COLUMNS } from '@/related-record-paths/constants/RelatedRecordPathTableGridTemplateColumns';
import { useRelatedRecordPathMutations } from '@/related-record-paths/hooks/useRelatedRecordPathMutations';
import { useRelatedRecordPaths } from '@/related-record-paths/hooks/useRelatedRecordPaths';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledTableContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

type SettingsObjectRelatedRecordPathsSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  isReadOnly: boolean;
};

export const SettingsObjectRelatedRecordPathsSection = ({
  objectMetadataItem,
  isReadOnly,
}: SettingsObjectRelatedRecordPathsSectionProps) => {
  const { t } = useLingui();
  const { relatedRecordPaths, loading } = useRelatedRecordPaths({
    objectMetadataId: objectMetadataItem.id,
  });
  const { createRelatedRecordPath, deleteRelatedRecordPath, isSaving } =
    useRelatedRecordPathMutations();

  const handleSubmit = ([
    firstFieldMetadataId,
    secondFieldMetadataId,
    thirdFieldMetadataId,
  ]: string[]) =>
    createRelatedRecordPath({
      objectMetadataId: objectMetadataItem.id,
      firstFieldMetadataId,
      secondFieldMetadataId,
      thirdFieldMetadataId,
      isInherent: false,
    });

  return (
    <StyledContent>
      <StyledTableContainer>
        <Table>
          <TableRow
            gridTemplateColumns={
              RELATED_RECORD_PATH_TABLE_GRID_TEMPLATE_COLUMNS
            }
          >
            <TableHeader>{t`Object`}</TableHeader>
            <TableHeader>{t`Relation`}</TableHeader>
            <TableHeader>{t`Type`}</TableHeader>
            <TableHeader />
          </TableRow>
          <TableBody>
            {relatedRecordPaths.length === 0 && !loading && (
              <StyledEmpty>{t`No related records follow this object yet`}</StyledEmpty>
            )}
            {relatedRecordPaths.map((relatedRecordPath) => (
              <SettingsObjectRelatedRecordPathTableRow
                key={relatedRecordPath.id}
                sourceObjectMetadataItem={objectMetadataItem}
                relatedRecordPath={relatedRecordPath}
                isReadOnly={isReadOnly}
                onDelete={deleteRelatedRecordPath}
              />
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
      {!isReadOnly && (
        <StyledButtonContainer>
          <SettingsObjectRelatedRecordPathAddDropdown
            sourceObjectMetadataItem={objectMetadataItem}
            disabled={isSaving}
            onSubmit={handleSubmit}
          />
        </StyledButtonContainer>
      )}
    </StyledContent>
  );
};
