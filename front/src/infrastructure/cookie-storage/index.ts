import Cookies, { CookieAttributes } from 'js-cookie';

type Listener = (
  newValue: string | undefined,
  oldValue: string | undefined,
) => void;

class CookieStorage {
  private listeners: Record<string, Listener[]> = {};

  getItem(key: string): string | undefined {
    return Cookies.get(key);
  }

  setItem(key: string, value: string, attributes?: CookieAttributes): void {
    const oldValue = this.getItem(key);
    Cookies.set(key, value, attributes);
    this.dispatch(key, value, oldValue);
  }

  removeItem(key: string): void {
    const oldValue = this.getItem(key);
    Cookies.remove(key);
    this.dispatch(key, undefined, oldValue);
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
