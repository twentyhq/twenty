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
import { IconPlus } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
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
        <Section>
          <H2Title
            title={t`Relations`}
            description={t`Relation between this object and other objects`}
          />
          <SettingsObjectRelationsTable
            objectMetadataItem={objectMetadataItem}
          />
          <StyledButtonContainer>
            {!readonly && (
              <UndecoratedLink
                to={getSettingsPath(
                  SettingsPath.ObjectNewFieldConfigure,
                  { objectNamePlural: objectMetadataItem.namePlural },
                  { fieldType: FieldMetadataType.MORPH_RELATION },
                )}
              >
                <Button
                  Icon={IconPlus}
                  title={t`Add relation`}
                  size="small"
                  variant="secondary"
                />
              </UndecoratedLink>
            )}
          </StyledButtonContainer>
        </Section>
      )}
      <Section>
        <H2Title
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
            <UndecoratedLink
              to={getSettingsPath(SettingsPath.ObjectNewFieldSelect, {
                objectNamePlural: objectMetadataItem.namePlural,
              })}
            >
              <Button
                Icon={IconPlus}
                title={t`Add Field`}
                size="small"
                variant="secondary"
              />
            </UndecoratedLink>
          )}
        </StyledButtonContainer>
      </Section>
    </StyledContentContainer>
  );
};
