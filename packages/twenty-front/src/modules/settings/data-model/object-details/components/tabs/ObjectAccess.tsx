import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { useLingui } from '@lingui/react/macro';
import { Section } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme';

import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { ObjectAccessRolesTable } from '@/settings/data-model/object-details/components/tabs/ObjectAccessRolesTable';
import { ObjectReadabilityPicker } from '@/settings/data-model/object-details/components/tabs/ObjectReadabilityPicker';
import { ObjectSharingReachPicker } from '@/settings/data-model/object-details/components/tabs/ObjectSharingReachPicker';
import { useObjectAccessOverview } from '@/settings/data-model/object-details/hooks/useObjectAccessOverview';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  MetadataReadability,
} from '~/generated-metadata/graphql';

type ObjectAccessProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
`;

const StyledSummary = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
`;

export const ObjectAccess = ({ objectMetadataItem }: ObjectAccessProps) => {
  const { t } = useLingui();
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();
  const isDDLLocked = useAtomStateValue(isDDLLockedState);
  const isRecordLevelSharingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
  );
  const { objectAccessOverview, error } = useObjectAccessOverview({
    objectMetadataId: objectMetadataItem.id,
  });

  const isReadOnly =
    isObjectMetadataReadOnly({ objectMetadataItem }) || isDDLLocked;
  const isReadabilityEditable = getIsMetadataItemCustom(objectMetadataItem);
  const objectLabel = objectMetadataItem.labelPlural;
  const isOpenByDefault =
    objectMetadataItem.readability === MetadataReadability.OPEN;

  return (
    <StyledContentContainer>
      <Section.Root>
        <Section.Header
          title={t`Who can see and edit by default`}
          description={t`What each role can do on ${objectLabel}. Open a role to change it.`}
        />
        {isDefined(error) && (
          <StyledSummary>{t`Access could not be loaded.`}</StyledSummary>
        )}
        {isDefined(objectAccessOverview) && (
          <ObjectAccessRolesTable roles={objectAccessOverview.roles} />
        )}
      </Section.Root>
      {isRecordLevelSharingEnabled && (
        <>
          {objectMetadataItem.readability !== MetadataReadability.INHERITED && (
            <Section.Root>
              <Section.Header
                title={t`New records`}
                description={t`Who sees a record of ${objectLabel} when it is created.`}
              />
              <ObjectReadabilityPicker
                objectMetadataItem={objectMetadataItem}
                isReadOnly={isReadOnly || !isReadabilityEditable}
              />
            </Section.Root>
          )}
          <Section.Root>
            <Section.Header
              title={t`Sharing`}
              description={t`Who a record of ${objectLabel} can be shared with.`}
            />
            <ObjectSharingReachPicker
              objectMetadataItem={objectMetadataItem}
              isReadOnly={isReadOnly}
            />
          </Section.Root>
          {isDefined(objectAccessOverview) && (
            <Section.Root>
              <Section.Header
                title={t`Today`}
                description={
                  isOpenByDefault
                    ? t`Records whose access differs from what roles give.`
                    : t`New records are private to their creator until shared.`
                }
              />
              <StyledSummary>
                {isOpenByDefault
                  ? t`${objectAccessOverview.restrictedRecordCount} restricted, ${objectAccessOverview.sharedRecordCount} shared with specific people`
                  : t`${objectAccessOverview.sharedRecordCount} shared with specific people`}
              </StyledSummary>
            </Section.Root>
          )}
        </>
      )}
    </StyledContentContainer>
  );
};
