import { DynamicModule, Module } from '@nestjs/common';

import { AppsModule } from 'src/apps/apps.module';
import { graphQLFactories } from 'src/engine/api/graphql/graphql-config/factories';
import { CoreEngineModule } from 'src/engine/core-modules/core-engine.module';
import { TWENTY_APP_METADATA } from 'src/engine/twenty-app/twenty-app.metadata';

const getDynamicModulesFromApps = (): DynamicModule[] => {
  // This assumes TWENTY_APPS are classes/modules with metadata that can directly be used as imports
  // This step needs adjustment if the metadata does not match this expectation

  const TWENTY_APPS = Reflect.getMetadata('imports', AppsModule);

  console.log(TWENTY_APPS);

  return TWENTY_APPS.map((app) => {
    const resolvers = Reflect.getMetadata(TWENTY_APP_METADATA.RESOLVERS, app);

    // Assuming `resolvers` are providers, not modules
    // You might need to create a dynamic module for each app that correctly encapsulates its resolvers
    if (resolvers) {
      return {
        module: app, // This needs to be a NestJS module, not just any class
        providers: [...resolvers], // Spread resolvers or construct providers array
      };
    } else {
      return { module: app };
    }
  }).filter(Boolean); // Filter out any undefined or invalid modules
};

@Module({
  imports: [CoreEngineModule, ...getDynamicModulesFromApps()],
  providers: [...graphQLFactories],
  exports: [...graphQLFactories],
})
export class GraphQLConfigModule {}
