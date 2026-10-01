import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';

const SEE_VERSION_WORKFLOW_RUN_UNIVERSAL_IDENTIFIER =
  'cc3a065c-c89e-40ac-9449-4272c55b1bb8';

export const findSeeVersionWorkflowRunCommandMenuItem = ({
  flatCommandMenuItemsByUniversalIdentifier,
}: {
  flatCommandMenuItemsByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
}): FlatCommandMenuItem | undefined => {
  const seeVersionWorkflowRun =
    flatCommandMenuItemsByUniversalIdentifier[
      SEE_VERSION_WORKFLOW_RUN_UNIVERSAL_IDENTIFIER
    ];

  return seeVersionWorkflowRun?.engineComponentKey ===
    EngineComponentKey.SEE_VERSION_WORKFLOW_RUN
    ? seeVersionWorkflowRun
    : undefined;
};
