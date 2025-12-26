import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { generateActivityTargetGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateActivityTargetGqlFields';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

describe('generateActivityTargetGqlFields', () => {
  describe('snapshot tests', () => {
    it('should match snapshot for Note with loadRelations="activity"', () => {
      const result = generateActivityTargetGqlFields({
        objectMetadataItems: generatedMockObjectMetadataItems,
        activityObjectNameSingular: CoreObjectNameSingular.Note,
        loadRelations: 'activity',
      });

      expect(result).toMatchSnapshot();
    });

    it('should match snapshot for Note with loadRelations="both"', () => {
      const result = generateActivityTargetGqlFields({
        objectMetadataItems: generatedMockObjectMetadataItems,
        activityObjectNameSingular: CoreObjectNameSingular.Note,
        loadRelations: 'both',
      });

      expect(result).toMatchSnapshot();
    });

    it('should match snapshot for Note with loadRelations="relations"', () => {
      const result = generateActivityTargetGqlFields({
        objectMetadataItems: generatedMockObjectMetadataItems,
        activityObjectNameSingular: CoreObjectNameSingular.Note,
        loadRelations: 'relations',
      });

      expect(result).toMatchSnapshot();
    });

    it('should match snapshot for Task with loadRelations="activity"', () => {
      const result = generateActivityTargetGqlFields({
        objectMetadataItems: generatedMockObjectMetadataItems,
        activityObjectNameSingular: CoreObjectNameSingular.Task,
        loadRelations: 'activity',
      });

      expect(result).toMatchSnapshot();
    });

    it('should match snapshot for Task with loadRelations="both"', () => {
      const result = generateActivityTargetGqlFields({
        objectMetadataItems: generatedMockObjectMetadataItems,
        activityObjectNameSingular: CoreObjectNameSingular.Task,
        loadRelations: 'both',
      });

      expect(result).toMatchSnapshot();
    });

    it('should match snapshot for Task with loadRelations="relations"', () => {
      const result = generateActivityTargetGqlFields({
        objectMetadataItems: generatedMockObjectMetadataItems,
        activityObjectNameSingular: CoreObjectNameSingular.Task,
        loadRelations: 'relations',
      });

      expect(result).toMatchSnapshot();
    });
  });
});
