import { type ModelsDevData } from 'src/engine/metadata-modules/ai/ai-models/types/models-dev-data.type';

// A 200 carrying an empty or reshaped payload would otherwise generate an
// empty catalog, and the sync PR automerges over the real one.
export const assertPayloadIsUsable = ({
  data,
  vendors,
}: {
  data: ModelsDevData;
  vendors: string[];
}): void => {
  const missing = vendors.filter(
    (vendor) => Object.keys(data[vendor]?.models ?? {}).length === 0,
  );

  if (missing.length > 0) {
    throw new Error(
      `models.dev payload is missing models for ${missing.join(', ')}; refusing to overwrite the catalog`,
    );
  }
};
