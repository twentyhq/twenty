import { type FrontComponent } from '~/generated-metadata/graphql';

export type FlatFrontComponent = Omit<FrontComponent, 'applicationTokenPair'>;
