import { CompanyPicker } from '@/companies/components/CompanyPicker';
import { PeoplePicker } from '@/people/components/PeoplePicker';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { UserPicker } from '@/users/components/UserPicker';

import { useRelationField } from '../../hooks/useRelationField';

type OwnProps = {
  onSubmit?: () => void;
  onCancel?: () => void;
};

export const RelationFieldInput = ({ onSubmit, onCancel }: OwnProps) => {
  const { fieldDefinition, fieldValue, setFieldValueForPersist } =
    useRelationField();

  const handleSubmit = (newEntity: EntityForSelect | null) => {
    setFieldValueForPersist(newEntity?.originalEntity ?? null);
    onSubmit?.();
  };

  switch (fieldDefinition.metadata.relationType) {
    case Entity.Person: {
      return (
        <PeoplePicker
          personId={fieldValue?.id ?? ''}
          companyId={fieldValue?.companyId ?? ''}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      );
    }
    case Entity.User: {
      return (
        <UserPicker
          userId={fieldValue?.id ?? ''}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      );
    }
    case Entity.Company: {
      return (
        <CompanyPicker
          companyId={fieldValue?.id ?? ''}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      );
    }
    default:
      console.warn(
        `Unknown relation type: "${fieldDefinition.metadata.relationType}" in RelationFieldInput`,
      );
      return <></>;
  }
};
