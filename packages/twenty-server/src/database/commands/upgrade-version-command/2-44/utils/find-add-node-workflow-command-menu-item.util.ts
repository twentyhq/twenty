import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';

const ADD_NODE_WORKFLOW_UNIVERSAL_IDENTIFIER =
  '818117fa-6cad-4ebc-83c1-40f4afc28d94';

export const findAddNodeWorkflowCommandMenuItem = ({
  flatCommandMenuItemsByUniversalIdentifier,
}: {
  flatCommandMenuItemsByUniversalIdentifier: Record<
    string,
    FlatCommandMenuItem | undefined
  >;
}): FlatCommandMenuItem | undefined => {
  const addNodeWorkflow =
    flatCommandMenuItemsByUniversalIdentifier[
      ADD_NODE_WORKFLOW_UNIVERSAL_IDENTIFIER
    ];

  return addNodeWorkflow?.engineComponentKey ===
    EngineComponentKey.ADD_NODE_WORKFLOW
    ? addNodeWorkflow
    : undefined;
};
