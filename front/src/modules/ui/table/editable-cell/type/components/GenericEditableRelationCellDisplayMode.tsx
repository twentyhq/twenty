import { useRecoilValue } from 'recoil';

import { CompanyChip } from '@/companies/components/CompanyChip';
import {
  ViewFieldDefinition,
  ViewFieldRelationMetadata,
} from '@/ui/editable-field/types/ViewField';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/tableEntityFieldFamilySelector';
import { UserChip } from '@/users/components/UserChip';
import { getLogoUrlFromDomainName } from '~/utils';

type OwnProps = {
  fieldDefinition: ViewFieldDefinition<ViewFieldRelationMetadata>;
  editModeHorizontalAlign?: 'left' | 'right';
  placeholder?: string;
};

export function GenericEditableRelationCellDisplayMode({
  fieldDefinition,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  // TODO: type value with generic getter
  const fieldValue = useRecoilValue<any | null>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: fieldDefinition.metadata.fieldName,
    }),
  );

  switch (fieldDefinition.metadata.relationType) {
    case Entity.Company: {
      return (
        <CompanyChip
          id={fieldValue?.id ?? ''}
          name={fieldValue?.name ?? ''}
          pictureUrl={getLogoUrlFromDomainName(fieldValue?.domainName)}
        />
      );
    }
    case Entity.User: {
      return (
        <UserChip
          id={fieldValue?.id ?? ''}
          name={fieldValue?.displayName ?? ''}
          pictureUrl={fieldValue?.avatarUrl ?? ''}
        />
      );
    }
    default:
      console.warn(
        `Unknown relation type: "${fieldDefinition.metadata.relationType}" in GenericEditableRelationCellEditMode`,
      );
      return <> </>;
  }
}
