export const observeAvatarImageLoads = () => {
  const NativeImage = window.Image;
  const loadedSources = new Set<string>();
  const cleanups = new Set<() => void>();

  window.Image = class extends NativeImage {
    constructor(...dimensions: ConstructorParameters<typeof NativeImage>) {
      super(...dimensions);

      const recordLoad = () => {
        loadedSources.add(this.getAttribute('src') ?? '');
        cleanup();
      };
      const cleanup = () => {
        this.removeEventListener('load', recordLoad);
        this.removeEventListener('error', cleanup);
        cleanups.delete(cleanup);
      };

      this.addEventListener('load', recordLoad);
      this.addEventListener('error', cleanup);
      cleanups.add(cleanup);
    }
  };

  return {
    hasLoaded: (source: string) => loadedSources.has(source),
    restore: () => {
      window.Image = NativeImage;
      for (const cleanup of cleanups) {
        cleanup();
      }
    },
  };
};
