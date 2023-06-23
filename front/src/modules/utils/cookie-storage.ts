import Cookies, { CookieAttributes } from 'js-cookie';

class CookieStorage {
  private keys: Set<string> = new Set();

  getItem(key: string): string | undefined {
    return Cookies.get(key);
  }

  setItem(key: string, value: string, attributes?: CookieAttributes): void {
    this.keys.add(key);
    Cookies.set(key, value, attributes);
  }

  removeItem(key: string): void {
    this.keys.delete(key);
    Cookies.remove(key);
  }

  clear(): void {
    this.keys.forEach((key) => this.removeItem(key));
  }
}

export const cookieStorage = new CookieStorage();
