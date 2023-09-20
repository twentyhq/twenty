import { useRecoilState } from 'recoil';

import { CompanyChip } from '@/companies/components/CompanyChip';
import { PersonChip } from '@/people/components/PersonChip';
import { FieldDoubleTextChipMetadata } from '@/ui/field/types/FieldMetadata';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';

import type { ViewFieldDefinition } from '../../../../../views/types/ViewFieldDefinition';

type OwnProps = {
  viewFieldDefinition: ViewFieldDefinition<FieldDoubleTextChipMetadata>;
};

export const GenericEditableDoubleTextChipCellDisplayMode = ({
  viewFieldDefinition,
}: OwnProps) => {
  const currentRowEntityId = useCurrentRowEntityId();

  const [firstValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.firstValueFieldName,
    }),
  );

  const [secondValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.secondValueFieldName,
    }),
  );

  const [avatarUrlValue] = useRecoilState<string>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: viewFieldDefinition.metadata.avatarUrlFieldName,
    }),
  );

  const displayName = [firstValue, secondValue].filter(Boolean).join(' ');

  switch (viewFieldDefinition.metadata.entityType) {
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
        `Unknown relation type: "${viewFieldDefinition.metadata.entityType}" in GenericEditableDoubleTextChipCellDisplayMode`,
      );
      return <> </>;
  }
};
