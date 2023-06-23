import Cookies, { CookieAttributes } from 'js-cookie';

type Listener = (
  newValue: string | undefined,
  oldValue: string | undefined,
) => void;

class CookieStorage {
  private listeners: Record<string, Listener[]> = {};
  private keys: Set<string> = new Set();

  getItem(key: string): string | undefined {
    return Cookies.get(key);
  }

  setItem(key: string, value: string, attributes?: CookieAttributes): void {
    const oldValue = this.getItem(key);

    this.keys.add(key);
    Cookies.set(key, value, attributes);
    this.dispatch(key, value, oldValue);
  }

  removeItem(key: string): void {
    const oldValue = this.getItem(key);

    this.keys.delete(key);
    Cookies.remove(key);
    this.dispatch(key, undefined, oldValue);
  }

  clear(): void {
    this.keys.forEach((key) => this.removeItem(key));
  }

  private dispatch(
    key: string,
    newValue: string | undefined,
    oldValue: string | undefined,
  ): void {
    if (this.listeners[key]) {
      this.listeners[key].forEach((callback) => callback(newValue, oldValue));
    }
  }

  addEventListener(key: string, callback: Listener): void {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
  }

  removeEventListener(key: string, callback: Listener): void {
    if (this.listeners[key]) {
      this.listeners[key] = this.listeners[key].filter(
        (listener) => listener !== callback,
      );
    }
  }
}

export const cookieStorage = new CookieStorage();
