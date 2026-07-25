export type LazyRouteComponentResolutionErrorOptions = {
  routeKey: string;
  modulePath: string;
  moduleExports: string[];
};

export class LazyRouteComponentResolutionError extends Error {
  public readonly routeKey: string;
  public readonly modulePath: string;
  public readonly moduleExports: string[];

  constructor({
    routeKey,
    modulePath,
    moduleExports,
  }: LazyRouteComponentResolutionErrorOptions) {
    super(`Lazy route component resolution failed for ${routeKey}`);

    Object.setPrototypeOf(this, LazyRouteComponentResolutionError.prototype);

    this.name = 'LazyRouteComponentResolutionError';
    this.routeKey = routeKey;
    this.modulePath = modulePath;
    this.moduleExports = moduleExports;
  }
}
