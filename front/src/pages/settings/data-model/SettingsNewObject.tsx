import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCreateOneObject } from '@/metadata/hooks/useCreateOneObject';
import { useObjectMetadataItemForSettings } from '@/metadata/hooks/useObjectMetadataItemForSettings';
import { getObjectSlug } from '@/metadata/utils/getObjectSlug';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsObjectFormSection } from '@/settings/data-model/components/SettingsObjectFormSection';
import { SettingsAvailableStandardObjectsSection } from '@/settings/data-model/new-object/components/SettingsAvailableStandardObjectsSection';
import {
  NewObjectType,
  SettingsNewObjectType,
} from '@/settings/data-model/new-object/components/SettingsNewObjectType';
import { SettingsObjectIconSection } from '@/settings/data-model/object-edit/SettingsObjectIconSection';
import { IconSettings } from '@/ui/display/icon';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { ViewType } from '@/views/types/ViewType';

export const SettingsNewObject = () => {
  const navigate = useNavigate();
  const [selectedObjectType, setSelectedObjectType] =
    useState<NewObjectType>('Standard');

  const {
    activateObjectMetadataItem: activateObject,
    createObjectMetadataItem: createObject,
    disabledObjectMetadataItems: disabledObjects,
  } = useObjectMetadataItemForSettings();

  const { createOneObject: createOneView } = useCreateOneObject({
    objectNamePlural: 'viewsV2',
  });

  const [selectedStandardObjectIds, setSelectedStandardObjectIds] = useState<
    Record<string, boolean>
  >({});

  const [customFormValues, setCustomFormValues] = useState<{
    description?: string;
    icon: string;
    labelPlural: string;
    labelSingular: string;
  }>({ icon: 'IconPigMoney', labelPlural: '', labelSingular: '' });

  const canSave =
    (selectedObjectType === 'Standard' &&
      Object.values(selectedStandardObjectIds).some(
        (isSelected) => isSelected,
      )) ||
    (selectedObjectType === 'Custom' &&
      !!customFormValues.labelPlural &&
      !!customFormValues.labelSingular);

  const handleSave = async () => {
    if (selectedObjectType === 'Standard') {
      await Promise.all(
        Object.entries(selectedStandardObjectIds).map(
          ([standardObjectId, isSelected]) =>
            isSelected ? activateObject({ id: standardObjectId }) : undefined,
        ),
      );

      navigate('/settings/objects');
    }

    if (selectedObjectType === 'Custom') {
      const createdObject = await createObject({
        labelPlural: customFormValues.labelPlural,
        labelSingular: customFormValues.labelSingular,
        description: customFormValues.description,
        icon: customFormValues.icon,
      });

      await createOneView?.({
        objectId: createdObject.data?.createOneObject.id,
        type: ViewType.Table,
        name: `All ${customFormValues.labelPlural}`,
      });

      navigate(
        createdObject.data?.createOneObject.isActive
          ? `/settings/objects/${getObjectSlug(
              createdObject.data.createOneObject,
            )}`
          : '/settings/objects',
      );
    }
  };

  return (
    <SubMenuTopBarContainer Icon={IconSettings} title="Settings">
      <SettingsPageContainer>
        <SettingsHeaderContainer>
          <Breadcrumb
            links={[
              { children: 'Objects', href: '/settings/objects' },
              { children: 'New' },
            ]}
          />
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            onCancel={() => {
              navigate('/settings/objects');
            }}
            onSave={handleSave}
          />
        </SettingsHeaderContainer>
        <Section>
          <H2Title
            title="Object type"
            description="The type of object you want to add"
          />
          <SettingsNewObjectType
            selectedType={selectedObjectType}
            onTypeSelect={setSelectedObjectType}
          />
        </Section>
        {selectedObjectType === 'Standard' && (
          <SettingsAvailableStandardObjectsSection
            objectItems={disabledObjects.filter(({ isCustom }) => !isCustom)}
            onChange={(selectedIds) =>
              setSelectedStandardObjectIds((previousSelectedIds) => ({
                ...previousSelectedIds,
                ...selectedIds,
              }))
            }
            selectedIds={selectedStandardObjectIds}
          />
        )}
        {selectedObjectType === 'Custom' && (
          <>
            <SettingsObjectIconSection
              label={customFormValues.labelPlural}
              iconKey={customFormValues.icon}
              onChange={({ iconKey }) => {
                setCustomFormValues((previousValues) => ({
                  ...previousValues,
                  icon: iconKey,
                }));
              }}
            />
            <SettingsObjectFormSection
              singularName={customFormValues.labelSingular}
              pluralName={customFormValues.labelPlural}
              description={customFormValues.description}
              onChange={(formValues) => {
                setCustomFormValues((previousValues) => ({
                  ...previousValues,
                  ...formValues,
                }));
              }}
            />
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
