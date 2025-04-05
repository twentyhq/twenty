export class Email {
    private readonly value: string;
  
    constructor(email: string) {
      if (!this.isValidEmail(email)) {
        throw new Error('Invalid email format');
      }
      this.value = email;
    }
  
    private isValidEmail(email: string): boolean {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
  
    toString(): string {
      return this.value;
    }

    equals(other: Email): boolean {
      return this.value === other.value;
    }
  }