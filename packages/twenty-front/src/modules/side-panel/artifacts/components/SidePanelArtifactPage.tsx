import { assertUnreachable } from 'twenty-shared/utils';

import { useCurrentSidePanelArtifact } from '@/side-panel/artifacts/hooks/useCurrentSidePanelArtifact';
import { SidePanelRecordPage } from '@/side-panel/pages/record-page/components/SidePanelRecordPage';
import { SidePanelRecordsPage } from '@/side-panel/pages/records-page/components/SidePanelRecordsPage';
import { SidePanelSettingsFieldMetadataPage } from '@/side-panel/pages/settings-metadata/components/SidePanelSettingsFieldMetadataPage';

export const SidePanelArtifactPage = () => {
  const artifact = useCurrentSidePanelArtifact();

  if (artifact === null) {
    return null;
  }

  switch (artifact.kind) {
    case 'record':
      return (
        <SidePanelRecordPage
          objectNameSingular={artifact.objectMetadataItem.nameSingular}
          recordId={artifact.recordId}
        />
      );
    case 'recordIndex':
      return (
        <SidePanelRecordsPage
          objectMetadataId={artifact.objectMetadataItem.id}
          viewId={artifact.view.id}
        />
      );
    case 'settingsField':
      return (
        <SidePanelSettingsFieldMetadataPage
          fieldMetadataId={artifact.fieldMetadataItem.id}
        />
      );
    default:
      return assertUnreachable(artifact);
  }
};
