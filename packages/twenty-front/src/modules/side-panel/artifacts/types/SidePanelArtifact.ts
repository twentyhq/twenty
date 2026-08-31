import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type View } from '@/views/types/View';

type SidePanelArtifactBase = {
  artifactPath: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export type SidePanelArtifact =
  | (SidePanelArtifactBase & {
      kind: 'record';
      recordId: string;
    })
  | (SidePanelArtifactBase & {
      kind: 'recordIndex';
      view: View;
    })
  | (SidePanelArtifactBase & {
      kind: 'settingsField';
      fieldMetadataItem: FieldMetadataItem;
    });
