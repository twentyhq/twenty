import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deleteSkill } from 'test/integration/metadata/suites/skill/utils/delete-skill.util';
import { findSkills } from 'test/integration/metadata/suites/skill/utils/find-skills.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

type TestContext = {
  input: () => {
    id: string;
  };
};

type DeleteSkillTestingContext = EachTestingContext<TestContext>[];

describe('Skill deletion should fail', () => {
  const failingSkillDeletionTestCases: DeleteSkillTestingContext = [
    {
      title: 'when deleting a non-existent skill',
      context: {
        input: () => ({
          id: faker.string.uuid(),
        }),
      },
    },
  ];

  it.each(eachTestingContextFilter(failingSkillDeletionTestCases))(
    '$title',
    async ({ context }) => {
      const { id } = context.input();

      const { errors } = await deleteSkill({
        expectToFail: true,
        input: {
          id,
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );

  it('should fail when attempting to delete a standard skill', async () => {
    const { data } = await findSkills({
      expectToFail: false,
      input: undefined,
      gqlFields: 'id name isCustom',
    });

    const standardSkill = data.skills.find((skill) => skill.isCustom === false);

    // If there are no standard skills, skip this test
    if (!standardSkill) {
      return;
    }

    const { errors } = await deleteSkill({
      expectToFail: true,
      input: {
        id: standardSkill.id,
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
