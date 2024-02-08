import { useRecoilValue } from 'recoil';

import { useOnboardingStatus } from '@/auth/hooks/useOnboardingStatus';
import { OnboardingStatus } from '@/auth/utils/getOnboardingStatus';
import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';

export const ObjectMetadataItemsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const onboardingStatus = useOnboardingStatus();

  return (
    <>
      <ObjectMetadataItemsLoadEffect />
      {(onboardingStatus !== OnboardingStatus.Completed ||
        !!objectMetadataItems.length) && (
        <RelationPickerScope relationPickerScopeId="relation-picker">
          {children}
        </RelationPickerScope>
      )}
    </>
  );
};
