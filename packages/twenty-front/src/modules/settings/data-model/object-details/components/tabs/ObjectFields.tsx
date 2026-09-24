import { NavigationButton } from '@/ui/input/components/NavigationButton';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { SettingsObjectRelationsTable } from '@/settings/data-model/object-details/components/SettingsObjectRelationsTable';
import { styled } from '@linaria/react';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { FieldMetadataType, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { SettingsObjectFieldTable } from '~/pages/settings/data-model/SettingsObjectFieldTable';

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
`;

type ObjectFieldsProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const ObjectFields = ({ objectMetadataItem }: ObjectFieldsProps) => {
  const { t } = useLingui();
  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  const readonly =
    isObjectMetadataReadOnly({
      objectMetadataItem,
    }) || isDDLLocked;

  const objectLabelSingular = objectMetadataItem.labelSingular;

  const hasRelations = objectMetadataItem.fields.some(
    (field) =>
      !isHiddenSystemField(field) &&
      (field.type === FieldMetadataType.RELATION ||
        field.type === FieldMetadataType.MORPH_RELATION),
  );

  return (
    <StyledContentContainer>
      {hasRelations && (
        <Section.Root>
          <Section.Header
            title={t`Relations`}
            description={t`Relation between this object and other objects`}
          />
          <SettingsObjectRelationsTable
            objectMetadataItem={objectMetadataItem}
          />
          <StyledButtonContainer>
            {!readonly && (
              <NavigationButton
                to={getSettingsPath(
                  SettingsPath.ObjectNewFieldConfigure,
                  { objectNamePlural: objectMetadataItem.namePlural },
                  { fieldType: FieldMetadataType.MORPH_RELATION },
                )}
                startIcon={<IconPlus />}
                size="sm"
                variant="outline"
              >{t`Add relation`}</NavigationButton>
            )}
          </StyledButtonContainer>
        </Section.Root>
      )}
      <Section.Root>
        <Section.Header
          title={t`Fields`}
          description={t`Customise the fields available in the ${objectLabelSingular} views and their display order in the ${objectLabelSingular} detail view and menus.`}
        />
        <SettingsObjectFieldTable
          objectMetadataItem={objectMetadataItem}
          mode="view"
          excludeRelations
        />
        <StyledButtonContainer>
          {!readonly && (
            <NavigationButton
              to={getSettingsPath(SettingsPath.ObjectNewFieldSelect, {
                objectNamePlural: objectMetadataItem.namePlural,
              })}
              startIcon={<IconPlus />}
              size="sm"
              variant="outline"
            >{t`Add Field`}</NavigationButton>
          )}
        </StyledButtonContainer>
      </Section.Root>
    </StyledContentContainer>
  );
};
