import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import {
  ActivityTargetableEntity,
  ActivityTargetableEntityType,
} from '@/activities/types/ActivityTargetableEntity';
import { selectedRowIdsSelector } from '@/ui/table/states/selectors/selectedRowIdsSelector';
import { tableEntitiesFamilyState } from '@/ui/table/states/tableEntitiesFamilyState';
import { ActivityType, Person } from '~/generated/graphql';

export const useCreateActivityForPeople = () => {
  const openCreateActivityRightDrawer =
    useOpenCreateActivityDrawerForSelectedRowIds();
  const selectedRowIds = useRecoilValue(selectedRowIdsSelector);

  return useRecoilCallback(
    ({ snapshot }) =>
      (type: ActivityType) => {
        const relatedEntites: ActivityTargetableEntity[] = [];
        for (const id of selectedRowIds) {
          const person = snapshot
            .getLoadable(tableEntitiesFamilyState(id))
            .getValue() as Person;
          if (
            person?.company?.id &&
            !relatedEntites.find((x) => x.id === person?.company?.id)
          ) {
            relatedEntites.push({
              id: person.company.id,
              type: ActivityTargetableEntityType.Company,
            });
          }
        }

        openCreateActivityRightDrawer(
          type,
          ActivityTargetableEntityType.Person,
          relatedEntites,
        );
      },
    [selectedRowIds, openCreateActivityRightDrawer],
  );
};
