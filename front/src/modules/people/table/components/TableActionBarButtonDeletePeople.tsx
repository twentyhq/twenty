import { getOperationName } from '@apollo/client/utilities';

import { useDeleteItems } from '@/people/hooks/deleteItems';
import { GET_PEOPLE } from '@/people/queries';
import { IconTrash } from '@/ui/icon/index';
import { EntityTableActionBarButton } from '@/ui/table/action-bar/components/EntityTableActionBarButton';
import { useDeleteManyPersonMutation } from '~/generated/graphql';

export function TableActionBarButtonDeletePeople() {
  const [deleteManyPerson] = useDeleteManyPersonMutation({
    refetchQueries: [getOperationName(GET_PEOPLE) ?? ''],
  });

  const { handleDeleteClick } = useDeleteItems({
    handleDeleteItems: deleteManyPerson,
  });

  return (
    <EntityTableActionBarButton
      label="Delete"
      icon={<IconTrash size={16} />}
      type="warning"
      onClick={handleDeleteClick}
    />
  );
}
