// Quick test script to verify the SDK works

import { createClient } from '../src/generated/metadata';

const client = createClient({
  url: 'http://localhost:3000/metadata',
});

async function testSDK() {
  try {
    console.log('🚀 Testing Twenty Metadata SDK...\n');

    // Test 1: List objects
    console.log('📋 Fetching first 5 objects...');
    const objectsResult = await client.query({
      objects: {
        __args: {
          paging: { first: 5 },
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
        },
      },
    });

    console.log(`✅ Found ${objectsResult.objects.edges.length} objects:`);
    objectsResult.objects.edges.forEach((edge) => {
      console.log(
        `   - ${edge.node.labelSingular} (${edge.node.nameSingular})${edge.node.isCustom ? ' [custom]' : ''}`,
      );
    });

    // Test 2: Get first object with all fields
    if (objectsResult.objects.edges.length > 0) {
      const firstObjectId = objectsResult.objects.edges[0].node.id;
      console.log(
        `\n📦 Fetching details for: ${objectsResult.objects.edges[0].node.labelSingular}`,
      );

      const objectDetail = await client.query({
        object: {
          __args: { id: firstObjectId },
          id: true,
          nameSingular: true,
          namePlural: true,
          labelSingular: true,
          labelPlural: true,
          description: true,
          icon: true,
          isCustom: true,
          isActive: true,
          fieldsList: {
            id: true,
            name: true,
            label: true,
            type: true,
            isCustom: true,
            isNullable: true,
          },
        },
      });

      console.log(`✅ Object: ${objectDetail.object.labelSingular}`);
      console.log(`   Name: ${objectDetail.object.nameSingular}`);
      console.log(
        `   Description: ${objectDetail.object.description || 'N/A'}`,
      );
      console.log(`   Icon: ${objectDetail.object.icon || 'N/A'}`);
      console.log(`   Fields count: ${objectDetail.object.fieldsList.length}`);
      console.log(`   First 5 fields:`);
      objectDetail.object.fieldsList.slice(0, 5).forEach((field) => {
        console.log(
          `      - ${field.label} (${field.name}) [${field.type}]${field.isCustom ? ' custom' : ''}`,
        );
      });
    }

    // Test 3: Get core views
    console.log(`\n🔍 Fetching core views...`);
    const viewsResult = await client.query({
      getCoreViews: {
        __args: {},
        id: true,
        name: true,
        type: true,
        key: true,
      },
    });

    console.log(`✅ Found ${viewsResult.getCoreViews.length} core views`);
    viewsResult.getCoreViews.slice(0, 3).forEach((view) => {
      console.log(`   - ${view.name} (${view.type})`);
    });

    console.log('\n✨ SDK test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing SDK:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
  }
}

// Run the test
testSDK();

