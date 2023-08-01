import { getOperationName } from '@apollo/client/utilities';

import { GET_COMPANIES } from '@/companies/queries';
import { useDeleteItems } from '@/people/hooks/deleteItems';
import { GET_PIPELINES } from '@/pipeline/queries';
import { IconTrash } from '@/ui/icon/index';
import { EntityTableActionBarButton } from '@/ui/table/action-bar/components/EntityTableActionBarButton';
import { useDeleteManyCompaniesMutation } from '~/generated/graphql';

export function TableActionBarButtonDeleteCompanies() {
  const [deleteCompanies] = useDeleteManyCompaniesMutation({
    refetchQueries: [
      getOperationName(GET_COMPANIES) ?? '',
      getOperationName(GET_PIPELINES) ?? '',
    ],
  });

  const { handleDeleteClick } = useDeleteItems({
    handleDeleteItems: deleteCompanies,
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
