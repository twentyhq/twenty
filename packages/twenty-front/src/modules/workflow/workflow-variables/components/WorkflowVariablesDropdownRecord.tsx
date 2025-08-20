import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import {
  type BaseOutputSchema,
  type FieldLeaf,
  type FieldNode,
  type RecordOutputSchema,
  type StepOutputSchema,
} from '@/workflow/workflow-variables/types/StepOutputSchema';

import { useGetObjectMetadataItemById } from '@/object-metadata/hooks/useGetObjectMetadataItemById';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { generateFakeValue } from '@/workflow/workflow-variables/utils/generateFakeValue';
import { getStepHeaderLabel } from '@/workflow/workflow-variables/utils/getStepHeaderLabel';
import { getVariableTemplateFromPath } from '@/workflow/workflow-variables/utils/getVariableTemplateFromPath';
import { isBaseOutputSchema } from '@/workflow/workflow-variables/utils/isBaseOutputSchema';
import { isRecordOutputSchema } from '@/workflow/workflow-variables/utils/isRecordOutputSchema';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronLeft,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

type WorkflowVariablesDropdownRecordProps = {
  step: StepOutputSchema;
  recordOutputSchema: RecordOutputSchema;
  onSelect: (value: string) => void;
  onBack: () => void;
};

const getCurrentSubStepFromPath = (
  recordOutputSchema: RecordOutputSchema,
  path: string[],
): RecordOutputSchema | FieldLeaf | FieldNode => {
  let currentSubStep: RecordOutputSchema | FieldLeaf | FieldNode =
    recordOutputSchema;
  for (const key of path) {
    if (isRecordOutputSchema(currentSubStep)) {
      currentSubStep = currentSubStep.fields[key];
    } else {
      currentSubStep = currentSubStep[key];
    }
  }

  return currentSubStep;
};

const getFakeValueFromType = (type: FieldMetadataType) => {
  const fakeValue = generateFakeValue(type, 'FieldMetadataType');

  return fakeValue ? String(fakeValue) : '';
};

export const WorkflowVariablesDropdownRecord = ({
  step,
  recordOutputSchema,
  onSelect,
  onBack,
}: WorkflowVariablesDropdownRecordProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchInputValue, setSearchInputValue] = useState('');
  const { getObjectMetadataItemById } = useGetObjectMetadataItemById();

  const getDisplayedSubStepFields = () => {
    const currentSubStep = getCurrentSubStepFromPath(
      recordOutputSchema,
      currentPath,
    );

    if (isRecordOutputSchema(currentSubStep)) {
      return currentSubStep.fields;
    }

    return currentSubStep;
  };

  const handleSelectField = (key: string) => {
    const currentSubStep = getCurrentSubStepFromPath(
      recordOutputSchema,
      currentPath,
    );

    const handleSelectRecordOutputSchema = ({
      currentSubStep,
    }: {
      currentSubStep: RecordOutputSchema;
    }) => {
      if (!currentSubStep.fields[key]?.isLeaf) {
        setCurrentPath([...currentPath, key]);
        setSearchInputValue('');
      } else {
        onSelect(
          getVariableTemplateFromPath({
            stepId: step.id,
            path: [...currentPath, key],
          }),
        );
      }
    };

    const handleSelectBaseOutputSchema = ({
      currentSubStep,
    }: {
      currentSubStep: BaseOutputSchema;
    }) => {
      if (!currentSubStep[key]?.isLeaf) {
        setCurrentPath([...currentPath, key]);
        setSearchInputValue('');
      } else {
        onSelect(
          getVariableTemplateFromPath({
            stepId: step.id,
            path: [...currentPath, key],
          }),
        );
      }

      if (isBaseOutputSchema(currentSubStep)) {
        handleSelectBaseOutputSchema({
          currentSubStep,
        });
      } else {
        handleSelectRecordOutputSchema({
          currentSubStep,
        });
      }
    };

    if (isRecordOutputSchema(currentSubStep)) {
      handleSelectRecordOutputSchema({
        currentSubStep,
      });
    } else if (isBaseOutputSchema(currentSubStep)) {
      handleSelectBaseOutputSchema({
        currentSubStep,
      });
    }
  };

  const goBack = () => {
    if (currentPath.length === 0) {
      onBack();
    } else {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const displayedFields = getDisplayedSubStepFields();
  const options = displayedFields ? Object.entries(displayedFields) : [];

  const filteredOptions = searchInputValue
    ? options.filter(([key]) =>
        key.toLowerCase().includes(searchInputValue.toLowerCase()),
      )
    : options;

  const getDisplayedSubStepObject = () => {
    const currentSubStep = getCurrentSubStepFromPath(
      recordOutputSchema,
      currentPath,
    );

    return currentSubStep.object;
  };

  const handleSelectObject = () => {
    const currentSubStep = getCurrentSubStepFromPath(
      recordOutputSchema,
      currentPath,
    );

    const isRelationField = currentSubStep.object.isRelationField ?? false;

    if (isRelationField) {
      onSelect(
        getVariableTemplateFromPath({
          stepId: step.id,
          path: currentPath,
        }),
      );
    } else {
      onSelect(
        getVariableTemplateFromPath({
          stepId: step.id,
          path: [...currentPath, 'id'],
        }),
      );
    }
  };

  const displayedSubStepObject = getDisplayedSubStepObject();

  const objectMetadataItem = isDefined(displayedSubStepObject?.objectMetadataId)
    ? getObjectMetadataItemById(displayedSubStepObject.objectMetadataId)
    : undefined;

  const shouldDisplaySubStepObject = searchInputValue
    ? isDefined(objectMetadataItem) &&
      isDefined(objectMetadataItem.labelSingular) &&
      objectMetadataItem.labelSingular
        .toLowerCase()
        .includes(searchInputValue.toLowerCase())
    : true;

  const shouldDisplayObject =
    shouldDisplaySubStepObject && isDefined(objectMetadataItem?.labelSingular);
  const nameSingular = objectMetadataItem?.labelSingular;

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={goBack}
            Icon={IconChevronLeft}
          />
        }
      >
        <OverflowingTextWithTooltip
          text={getStepHeaderLabel(step, currentPath)}
        />
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={searchInputValue}
        onChange={(event) => setSearchInputValue(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {shouldDisplayObject && (
          <MenuItemSelect
            selected={false}
            focused={false}
            onClick={handleSelectObject}
            text={objectMetadataItem.labelSingular}
            hasSubMenu={false}
            LeftIcon={
              objectMetadataItem.icon
                ? getIcon(objectMetadataItem.icon)
                : undefined
            }
            contextualText={t`Pick a ${nameSingular} record`}
          />
        )}
        {filteredOptions.length > 0 && shouldDisplayObject && (
          <DropdownMenuSeparator />
        )}
        {filteredOptions.map(([key, subStep]) => (
          <MenuItemSelect
            key={key}
            selected={false}
            focused={false}
            onClick={() => handleSelectField(key)}
            text={subStep.label ?? key}
            hasSubMenu={!subStep.isLeaf}
            LeftIcon={subStep.icon ? getIcon(subStep.icon) : undefined}
            contextualText={getFakeValueFromType(subStep.type)}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
