import { Command } from '@/command-menu-item/display/components/Command';
import { EngineCommandMenuItem } from '@/command-menu-item/display/components/EngineCommandMenuItem';
import { HeadlessFrontComponentCommandMenuItem } from '@/command-menu-item/display/components/HeadlessFrontComponentCommandMenuItem';
import { WorkflowCommandMenuItem } from '@/command-menu-item/display/components/WorkflowCommandMenuItem';
import { type useOpenFrontComponentInSidePanel } from '@/side-panel/hooks/useOpenFrontComponentInSidePanel';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

type ResolveComponentParams = {
  item: CommandMenuItemFieldsFragment;
  displayLabel: Nullable<string>;
  Icon: IconComponent;
  openFrontComponentInSidePanel: ReturnType<
    typeof useOpenFrontComponentInSidePanel
  >['openFrontComponentInSidePanel'];
  recordId?: string;
  objectNameSingular?: string;
  workflowVersionById: Map<
    string,
    Pick<WorkflowVersion, 'id' | 'workflowId' | 'trigger'>
  >;
};

export const resolveCommandMenuItemComponent = ({
  item,
  displayLabel,
  Icon,
  openFrontComponentInSidePanel,
  recordId,
  objectNameSingular,
  workflowVersionById,
}: ResolveComponentParams): React.ReactNode | null => {
  if (isDefined(item.engineComponentKey)) {
    return (
      <EngineCommandMenuItem
        commandMenuItemId={item.id}
        engineComponentKey={item.engineComponentKey}
      />
    );
  }

  if (isDefined(item.frontComponentId)) {
    const isHeadless = item.frontComponent?.isHeadless === true;

    if (isHeadless) {
      return (
        <HeadlessFrontComponentCommandMenuItem
          frontComponentId={item.frontComponentId}
          commandMenuItemId={item.id}
          recordId={recordId}
          objectNameSingular={objectNameSingular}
        />
      );
    }

    const handleClick = () => {
      openFrontComponentInSidePanel({
        frontComponentId: item.frontComponentId!,
        pageTitle: displayLabel ?? '',
        pageIcon: Icon,
        recordContext:
          isDefined(recordId) && isDefined(objectNameSingular)
            ? { recordId, objectNameSingular }
            : undefined,
      });
    };

    return <Command onClick={handleClick} />;
  }

  if (isDefined(item.workflowVersionId)) {
    const workflowVersion = workflowVersionById.get(item.workflowVersionId);

    if (!isDefined(workflowVersion)) {
      return null;
    }

    return (
      <WorkflowCommandMenuItem
        workflowVersion={workflowVersion}
        availabilityType={item.availabilityType}
        availabilityObjectMetadataId={item.availabilityObjectMetadataId}
      />
    );
  }

  return null;
};
