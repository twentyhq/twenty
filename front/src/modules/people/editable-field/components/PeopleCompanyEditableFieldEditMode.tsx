import styled from '@emotion/styled';

import { useFilteredSearchCompanyQuery } from '@/companies/queries';
import { useEditableField } from '@/ui/editable-field/hooks/useEditableField';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import {
  Company,
  Person,
  useUpdateOnePersonMutation,
} from '~/generated/graphql';

export type OwnProps = {
  people: Pick<Person, 'id'> & { company?: Pick<Company, 'id'> | null };
};

const StyledContainer = styled.div`
  left: 0px;
  position: absolute;
  top: -8px;
`;

export function PeopleCompanyEditableFieldEditMode({ people }: OwnProps) {
  const { closeEditableField } = useEditableField();

  const [searchFilter] = useRecoilScopedState(
    relationPickerSearchFilterScopedState,
  );
  const [updatePerson] = useUpdateOnePersonMutation();

  const companies = useFilteredSearchCompanyQuery({
    searchFilter,
    selectedIds: people.company?.id ? [people.company.id] : [],
  });

  async function handleEntitySelected(
    entity: EntityForSelect | null | undefined,
  ) {
    if (entity) {
      await updatePerson({
        variables: {
          where: {
            id: people.id,
          },
          data: {
            company: { connect: { id: entity.id } },
          },
        },
      });
    }

    closeEditableField();
  }

  function handleCancel() {
    closeEditableField();
  }

  return (
    <StyledContainer>
      <SingleEntitySelect
        onEntitySelected={handleEntitySelected}
        entities={{
          entitiesToSelect: companies.entitiesToSelect,
          selectedEntity: companies.selectedEntities[0],
          loading: companies.loading,
        }}
        onCancel={handleCancel}
      />
    </StyledContainer>
  );
}
