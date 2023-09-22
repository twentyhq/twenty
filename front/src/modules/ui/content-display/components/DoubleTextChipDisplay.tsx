import { CompanyChip } from '@/companies/components/CompanyChip';
import { PersonChip } from '@/people/components/PersonChip';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';

type OwnProps = {
  entityType: Entity;
  displayName: string;
  currentRowEntityId: string | null;
  avatarUrlValue?: string;
};

export const DoubleTextChipDisplay = ({
  entityType,
  displayName,
  currentRowEntityId,
  avatarUrlValue,
}: OwnProps) => {
  switch (entityType) {
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
        `Unknown relation type: "${entityType}" in GenericEditableDoubleTextChipCellDisplayMode`,
      );
      return <> </>;
  }
};
