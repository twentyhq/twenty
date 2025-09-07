import { useEffect } from 'react';

interface ScriptEntry {
  count: number;
  element: HTMLScriptElement;
  loaded: boolean;
  callbacks: Array<() => void>;
}

const scriptCache = new Map<string, ScriptEntry>();

export interface UseScriptLoaderParams {
  src?: string | null;
  onLoad?: () => void;
  attributes?: Record<string, string | boolean>;
}

export const useScriptLoader = ({
  src,
  onLoad,
  attributes,
}: UseScriptLoaderParams): void => {
  useEffect(() => {
    if (!src) {
      return;
    }

    let entry = scriptCache.get(src);

    if (entry) {
      entry.count += 1;

      if (entry.loaded) {
        onLoad?.();
      } else if (onLoad) {
        entry.callbacks.push(onLoad);
      }
    } else {
      const script = document.createElement('script');
      script.src = src;

      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          if (typeof value === 'boolean') {
            (script as any)[key] = value;
          } else {
            script.setAttribute(key, String(value));
          }
        });
      }

      entry = {
        count: 1,
        element: script,
        loaded: false,
        callbacks: onLoad ? [onLoad] : [],
      };

      script.addEventListener('load', () => {
        entry!.loaded = true;
        entry!.callbacks.forEach((cb) => cb());
        entry!.callbacks = [];
      });

      document.body.appendChild(script);
      scriptCache.set(src, entry);
    }

    return () => {
      const cached = scriptCache.get(src);
      if (!cached) {
        return;
      }

      cached.count -= 1;

      if (onLoad) {
        cached.callbacks = cached.callbacks.filter((cb) => cb !== onLoad);
      }

      if (cached.count === 0) {
        cached.element.parentNode?.removeChild(cached.element);
        scriptCache.delete(src);
      }
    };
  }, [src, onLoad, attributes]);
};

