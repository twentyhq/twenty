import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useOpenCreateActivityDrawerForSelectedRowIds } from '@/activities/hooks/useOpenCreateActivityDrawerForSelectedRowIds';
import {
  ActivityTargetableEntity,
  ActivityTargetableEntityType,
} from '@/activities/types/ActivityTargetableEntity';
import { selectedRowIdsSelector } from '@/ui/Data/Data Table/states/selectors/selectedRowIdsSelector';
import { entityFieldsFamilyState } from '@/ui/Data/Field/states/entityFieldsFamilyState';
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
            .getLoadable(entityFieldsFamilyState(id))
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
