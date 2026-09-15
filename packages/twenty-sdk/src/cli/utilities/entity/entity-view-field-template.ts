import { v4 } from 'uuid';

export const getViewFieldBaseFile = ({
  universalIdentifier = v4(),
}: {
  universalIdentifier?: string;
}) => {
  return `import {
  defineViewField,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

export default defineViewField({
  universalIdentifier: '${universalIdentifier}',
  // The universalIdentifier of the existing view to add this column to
  viewUniversalIdentifier: 'STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.<fill-later>.views.<fill-later>.universalIdentifier',
  // The universalIdentifier of the field to display in that view
  fieldMetadataUniversalIdentifier: '<fill-later>',
  position: 0,
  isVisible: true,
  size: 150,
});
`;
};
