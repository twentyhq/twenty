import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectMetadataSettingsReadOnly } from '@/object-record/read-only/utils/isObjectMetadataSettingsReadOnly';
import { SettingsObjectRelationsTable } from '@/settings/data-model/object-details/components/SettingsObjectRelationsTable';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { SettingsObjectFieldTable } from '~/pages/settings/data-model/SettingsObjectFieldTable';

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

type ObjectFieldsProps = {
  objectMetadataItem: ObjectMetadataItem;
};

export const ObjectFields = ({ objectMetadataItem }: ObjectFieldsProps) => {
  const readonly = isObjectMetadataSettingsReadOnly({
    objectMetadataItem,
  });

  const { t } = useLingui();
  const objectLabelSingular = objectMetadataItem.labelSingular;

  const hasRelations = objectMetadataItem.fields.some(
    (field) =>
      !field.isSystem &&
      (field.type === FieldMetadataType.RELATION ||
        field.type === FieldMetadataType.MORPH_RELATION),
  );

  return (
    <>
      {hasRelations && (
        <Section>
          <H2Title
            title={t`Relations`}
            description={t`Relation between this object and other objects`}
          />
          <SettingsObjectRelationsTable
            objectMetadataItem={objectMetadataItem}
          />
          {!readonly && (
            <StyledButtonContainer>
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
            </StyledButtonContainer>
          )}
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
        {!readonly && (
          <StyledButtonContainer>
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
          </StyledButtonContainer>
        )}
      </Section>
    </>
  );
};
