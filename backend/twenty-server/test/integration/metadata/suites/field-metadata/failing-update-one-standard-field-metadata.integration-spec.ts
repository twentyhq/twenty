import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';

type UpdateOneStandardFieldMetadataTestingContext = EachTestingContext<
  Partial<UpdateFieldInput>
>[];

const failingUpdateTestsUseCase: UpdateOneStandardFieldMetadataTestingContext =
  [
    {
      title: 'when trying to update name on standard field',
      context: {
        name: 'newName',
      },
    },
    {
      title: 'when trying to update isLabelSyncedWithName on standard field',
      context: {
        isLabelSyncedWithName: false,
      },
    },
    {
      title: 'when trying to update several forbidden properties',
      context: {
        name: 'newName',
        isLabelSyncedWithName: true,
      },
    },
  ];

const allTestsUseCases = [...failingUpdateTestsUseCase];

describe('Standard field metadata update should be ignored', () => {
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
        fieldsList {
          id
          name
          label
          description
          icon
          isActive
          isCustom
          isLabelSyncedWithName
        }
      `,
    });

    const companyObject = objects.find((o) => o.nameSingular === 'company');

    jestExpectToBeDefined(companyObject);

    const companyNameField = companyObject.fieldsList?.find(
      (field) => field.name === 'name' && !field.isCustom,
    );

    jestExpectToBeDefined(companyNameField);
    companyNameFieldMetadataId = companyNameField.id;
  });

  it.each(eachTestingContextFilter(allTestsUseCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await updateOneFieldMetadata({
        input: {
          idToUpdate: companyNameFieldMetadataId,
          updatePayload: context,
        },
        expectToFail: true,
        gqlFields: `
          id
          name
          label
          description
          icon
          isActive
          isCustom
          isLabelSyncedWithName
        `,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});

// TODO: Enable this test once isUnique set as editable on standard fields

xdescribe('Standard field with standard unique index update should fail on isUnique change', () => {
  let companyDomainNameFieldMetadataId: string;

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
        fieldsList {
          id
          name
          label
          isCustom
          isUnique
        }
      `,
    });

    const companyObject = objects.find((o) => o.nameSingular === 'company');

    jestExpectToBeDefined(companyObject);

    const companyDomainNameField = companyObject.fieldsList?.find(
      (field) => field.name === 'domainName' && !field.isCustom,
    );

    jestExpectToBeDefined(companyDomainNameField);
    companyDomainNameFieldMetadataId = companyDomainNameField.id;
  });

  it('should fail when trying to remove unique constraint on standard field with standard index', async () => {
    const { errors } = await updateOneFieldMetadata({
      input: {
        idToUpdate: companyDomainNameFieldMetadataId,
        updatePayload: {
          isUnique: false,
        },
      },
      gqlFields: `
        id
        name
        isUnique
      `,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });
});
