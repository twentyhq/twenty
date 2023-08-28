import { useRecoilState } from 'recoil';

import { CompanyChip } from '@/companies/components/CompanyChip';
import { PersonChip } from '@/people/components/PersonChip';
import type { ViewFieldDoubleTextChipMetadata } from '@/ui/editable-field/types/ViewField';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

type OwnProps = {
  columnDefinition: ColumnDefinition<ViewFieldDoubleTextChipMetadata>;
};

export function GenericEditableDoubleTextChipCellDisplayMode({
  columnDefinition,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  const [firstValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.firstValueFieldName,
    }),
  );

  const [secondValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.secondValueFieldName,
    }),
  );

  const [avatarUrlValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: columnDefinition.metadata.avatarUrlFieldName,
    }),
  );

  const displayName =
    firstValue || secondValue ? `${firstValue} ${secondValue}` : ' ';

  switch (columnDefinition.metadata.entityType) {
    case Entity.Company: {
      return <CompanyChip id={currentRowEntityId ?? ''} name={displayName} />;
    }
    case Entity.Person: {
      return (
        <PersonChip
          id={currentRowEntityId ?? ''}
          name={displayName}
          pictureUrl={avatarUrlValue}
        />
      );
    }
    default:
      console.warn(
        `Unknown relation type: "${columnDefinition.metadata.entityType}" in GenericEditableDoubleTextChipCellDisplayMode`,
      );
      return <> </>;
  }
}
