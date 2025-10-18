// Example: How to use the Twenty Metadata SDK

import { createClient, everything } from '../src/generated/metadata';

// Create the client
const client = createClient({
  url: 'http://localhost:3000/metadata',
  // Add headers if needed for authentication
  // headers: {
  //   'Authorization': 'Bearer YOUR_TOKEN'
  // }
});

// Example 1: Get a single object by ID
async function getObjectById(objectId: string) {
  const result = await client.query({
    object: {
      __args: { id: objectId },
      id: true,
      nameSingular: true,
      namePlural: true,
      labelSingular: true,
      labelPlural: true,
      description: true,
      icon: true,
      isCustom: true,
      isActive: true,
      // Get all fields for this object
      fieldsList: {
        id: true,
        name: true,
        label: true,
        type: true,
        description: true,
        isCustom: true,
        isNullable: true,
        defaultValue: true,
      },
    },
  });

  return result.object;
}

// Example 2: List all objects with pagination
async function listObjects() {
  const result = await client.query({
    objects: {
      __args: {
        paging: { first: 20 },
        filter: {},
      },
      edges: {
        node: {
          id: true,
          nameSingular: true,
          labelSingular: true,
          isCustom: true,
          isActive: true,
        },
      },
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: true,
        startCursor: true,
        endCursor: true,
      },
    },
  });

  return result.objects;
}

// Example 3: Dynamic field selection
async function getObjectWithCustomFields<T>(objectId: string, fields: T) {
  const result = await client.query({
    object: {
      __args: { id: objectId },
      ...fields,
    },
  });

  return result.object;
}

// Usage with dynamic fields:
// const object = await getObjectWithCustomFields('some-id', {
//   id: true,
//   nameSingular: true,
//   fieldsList: {
//     name: true,
//     type: true,
//   }
// })

// Example 4: Get all fields using the `everything` helper
async function getObjectWithEverything(objectId: string) {
  const result = await client.query({
    object: {
      __args: { id: objectId },
      ...everything, // Gets all scalar fields
      fieldsList: {
        ...everything, // Gets all scalar fields for each field
      },
    },
  });

  return result.object;
}

// Example 5: Create a custom object (mutation)
async function createCustomObject(
  nameSingular: string,
  namePlural: string,
  labelSingular: string,
  labelPlural: string,
) {
  const result = await client.mutation({
    createOneObject: {
      __args: {
        input: {
          object: {
            nameSingular,
            namePlural,
            labelSingular,
            labelPlural,
          },
        },
      },
      id: true,
      nameSingular: true,
      labelSingular: true,
      createdAt: true,
    },
  });

  return result.createOneObject;
}

// Example 6: Update an object
async function updateObject(
  objectId: string,
  update: { labelSingular?: string; labelPlural?: string; description?: string },
) {
  const result = await client.mutation({
    updateOneObject: {
      __args: {
        input: {
          id: objectId,
          update,
        },
      },
      id: true,
      labelSingular: true,
      labelPlural: true,
      description: true,
      updatedAt: true,
    },
  });

  return result.updateOneObject;
}

// Example 7: Get core views for an object
async function getCoreViews(objectMetadataId?: string) {
  const result = await client.query({
    getCoreViews: {
      __args: {
        objectMetadataId,
      },
      id: true,
      name: true,
      type: true,
      key: true,
      icon: true,
    },
  });

  return result.getCoreViews;
}

// Example 8: Filter objects
async function getCustomObjects() {
  const result = await client.query({
    objects: {
      __args: {
        paging: { first: 50 },
        filter: {
          isCustom: { is: true },
        },
      },
      edges: {
        node: {
          id: true,
          nameSingular: true,
          labelSingular: true,
          createdAt: true,
        },
      },
    },
  });

  return result.objects.edges.map((edge) => edge.node);
}

// Export examples
export {
    createCustomObject, getCoreViews,
    getCustomObjects, getObjectById, getObjectWithCustomFields,
    getObjectWithEverything, listObjects, updateObject
};

