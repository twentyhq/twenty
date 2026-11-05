import { type WorkspaceApiNamingMetadata } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-metadata.type';
import { type WorkspaceApiNamingView } from 'src/engine/api/common/workspace-api-naming/types/workspace-api-naming-view.type';
import { validateWorkspaceApiNamingViewOrThrow } from 'src/engine/api/common/workspace-api-naming/utils/validate-workspace-api-naming-view-or-throw.util';
import { projectMetadataTechnicalNames } from 'src/engine/metadata-modules/flat-entity/utils/project-metadata-technical-names.util';

export const projectWorkspaceApiNamingMetadataOrThrow = ({
  view,
  metadata,
}: {
  view: WorkspaceApiNamingView;
  metadata: WorkspaceApiNamingMetadata;
}): WorkspaceApiNamingMetadata => {
  validateWorkspaceApiNamingViewOrThrow({ view, metadata });

  return {
    ...metadata,
    ...projectMetadataTechnicalNames({
      metadata,
      technicalNamesByUniversalIdentifier: view,
    }),
  };
};
