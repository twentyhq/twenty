import { useRecoilValue } from 'recoil';

import { CompanyChip } from '@/companies/components/CompanyChip';
import type { ViewFieldChipMetadata } from '@/ui/editable-field/types/ViewField';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { useCurrentRowEntityId } from '@/ui/table/hooks/useCurrentEntityId';
import { tableEntityFieldFamilySelector } from '@/ui/table/states/selectors/tableEntityFieldFamilySelector';
import { getLogoUrlFromDomainName } from '~/utils';

import type { ColumnDefinition } from '../../../types/ColumnDefinition';

type OwnProps = {
  fieldDefinition: ColumnDefinition<ViewFieldChipMetadata>;
};

export function GenericEditableChipCellDisplayMode({
  fieldDefinition,
}: OwnProps) {
  const currentRowEntityId = useCurrentRowEntityId();

  const content = useRecoilValue<any | null>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: fieldDefinition.metadata.contentFieldName,
    }),
  );

  const chipUrl = useRecoilValue<any | null>(
    tableEntityFieldFamilySelector({
      entityId: currentRowEntityId ?? '',
      fieldName: fieldDefinition.metadata.urlFieldName,
    }),
  );

  switch (fieldDefinition.metadata.relationType) {
    case Entity.Company: {
      return (
        <CompanyChip
          id={currentRowEntityId ?? ''}
          name={content ?? ''}
          pictureUrl={getLogoUrlFromDomainName(chipUrl)}
        />
      );
    }
    default:
      console.warn(
        `Unknown relation type: "${fieldDefinition.metadata.relationType}" in GenericEditableChipCellEditMode`,
      );
      return <> </>;
  }
}
