import { defineLogicFunction } from 'twenty-sdk/define';

// Logic:
// Read all objects and fields
// Find custom workspace app's id (for future references)
// Filter out all those created by apps (inform user about it?)
// Re-create objects and fields using GraphQL API
// Using REST API read all objects and re-create them (what about the order?)

// Notes:
// Add a way to run this over 15 min (routeToYourOwnPost.ts basically)
// Find a way to decide which objects should be created first based on relations
// Store all data in separate object, JSON {object: string, cursor?: string)
// Add a way to delay requests to prevent hitting throttle limit
// Maximum amount of records per 15 min: 140k on Pro, 280k on Org
// Find a way to use app's API key to connect to REST API
// How to find out to which apps x object/field belongs to? Check by applicationId and compare it to installed app
const handler = async (params: {
  a: string;
  b: number;
}): Promise<{ message: string }> => {
  const { a, b } = params;

  // Replace with your own logic
  const message = `Hello, input: ${a} and ${b}`;

  return { message };
};

export default defineLogicFunction({
  universalIdentifier: 'b058e57c-4ac6-4b18-b147-9099260da9de',
  name: 'entry-point',
  description: 'Add a description for your logic function',
  timeoutSeconds: 5,
  handler,
    // Add your trigger here
    // Route trigger example:
    // httpRouteTriggerSettings: {
    //   path: '/entry-point',
    //   httpMethod: 'POST',
    //   isAuthRequired: true,
    // },
    // Cron trigger example:
    // cronTriggerSettings: {
    //   pattern: '0 0 * * *', // Daily at midnight
    // },
    // Database event trigger example:
    // databaseEventTriggerSettings: {
    //   eventName: 'objectName.created',
    // },
});
