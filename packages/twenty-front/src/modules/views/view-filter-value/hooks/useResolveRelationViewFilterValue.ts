import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useRecoilValue } from 'recoil';
import { safeStringArrayJSONSchema } from '~/utils/validation-schemas/safeStringArrayJSONSchema';

export const useMapRelationViewFilterValueSpecialIdsToRecordIds = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const mapRelationViewFilterValueSpecialIdsToRecordIds = (
    recordIdsAndSpecialIds: string[],
  ) =>
    recordIdsAndSpecialIds.map((recordIdOrSpecialId) => {
      if (!currentWorkspaceMember) {
        throw new Error('Current workspace member is not defined');
      }

      return recordIdOrSpecialId === 'CURRENT_WORKSPACE_MEMBER'
        ? currentWorkspaceMember.id
        : recordIdOrSpecialId;
    });

  return { mapRelationViewFilterValueSpecialIdsToRecordIds };
};

export const useResolveRelationViewFilterValue = () => {
  const { mapRelationViewFilterValueSpecialIdsToRecordIds } =
    useMapRelationViewFilterValueSpecialIdsToRecordIds();

  const resolveRelationViewFilterValue = (viewFilterValue: string) => {
    const recordIdsAndSpecialIds =
      safeStringArrayJSONSchema.parse(viewFilterValue);

    return mapRelationViewFilterValueSpecialIdsToRecordIds(
      recordIdsAndSpecialIds,
    );
  };

  return { resolveRelationViewFilterValue };
};
