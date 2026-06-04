import { v4 } from 'uuid';

// Scaffolds a standalone view field that attaches a field to an EXISTING view
// (standard or from another application) by universalIdentifier. The author
// must fill in viewUniversalIdentifier + fieldMetadataUniversalIdentifier and
// pick a non-colliding position.
export const getViewFieldBaseFile = ({
  universalIdentifier = v4(),
}: {
  universalIdentifier?: string;
}) => {
  return `import { defineViewField } from 'twenty-sdk/define';

export default defineViewField({
  universalIdentifier: '${universalIdentifier}',
  // The universalIdentifier of the existing view to add this column to
  viewUniversalIdentifier: 'fill-later',
  // The universalIdentifier of the field to display in that view
  fieldMetadataUniversalIdentifier: 'fill-later',
  position: 0,
  isVisible: true,
  size: 150,
});
`;
};
