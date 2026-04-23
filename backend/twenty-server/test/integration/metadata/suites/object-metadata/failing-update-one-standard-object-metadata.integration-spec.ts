import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { type UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';

type TestingRuntimeContext = {
  objectMetadataId: string;
  textFieldMetadataId: string;
};

type UpdateOneStandardObjectMetadataTestingContext = EachTestingContext<
  | ((args: TestingRuntimeContext) => Partial<UpdateObjectPayload>)
  | Partial<UpdateObjectPayload>
>[];

const failingUpdateTestsUseCase: UpdateOneStandardObjectMetadataTestingContext =
  [
    {
      title: 'when trying to update nameSingular on standard object',
      context: {
        nameSingular: 'newCompany',
      },
    },
    {
      title: 'when trying to update namePlural on standard object',
      context: {
        namePlural: 'newCompanies',
      },
    },
    {
      title:
        'when trying to update labelIdentifierFieldMetadataId on standard object',
      context: ({ textFieldMetadataId }) => ({
        labelIdentifierFieldMetadataId: textFieldMetadataId,
      }),
    },
    {
      title: 'when trying to update several forbidden properties',
      context: {
        namePlural: 'newCompanies',
        isActive: false,
        isLabelSyncedWithName: false,
        shortcut: 'whatever',
      },
    },
  ];

describe('Standard object metadata update should fail', () => {
  let companyObjectMetadataId: string;
  let companyNameFieldMetadataId: string;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 100 },
      },
      gqlFields: `
        id
        nameSingular
        namePlural
        labelSingular
        labelPlural
        isLabelSyncedWithName
        fieldsList {
          id
          name
          type
        }
      `,
    });

    const companyObject = objects.find((o) => o.nameSingular === 'company');

    jestExpectToBeDefined(companyObject);
    companyObjectMetadataId = companyObject.id;

    const nameField = companyObject.fieldsList?.find(
      (field: { name: string }) => field.name === 'name',
    );

    jestExpectToBeDefined(nameField);
    companyNameFieldMetadataId = nameField!.id;
  });

  it.each(eachTestingContextFilter(failingUpdateTestsUseCase))(
    '$title',
    async ({ context }) => {
      const updatePayload =
        typeof context === 'function'
          ? context({
              objectMetadataId: companyObjectMetadataId,
              textFieldMetadataId: companyNameFieldMetadataId,
            })
          : context;

      const { errors } = await updateOneObjectMetadata({
        input: {
          idToUpdate: companyObjectMetadataId,
          updatePayload,
        },
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );
});
