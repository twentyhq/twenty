import { CountryNames, CountryLanguages, AIModel } from '../types/types.js';

export const names: CountryNames = {
    US: ["John", "Richard", "Sarah"],
    IN: ["Aditya", "Arnav", "Daksh"],
    // JP: ["Naomi", "Tanjiro", "Izuku"],
    // GB: ["David", "Chris", "Helen"],
    // FR: ["Adrien", "Claire", "Juliette"]
};

export const languages: CountryLanguages = {
    US: ["ENGLISH_UNITED_STATES", "ENGLISH_UNITED_KINGDOM"],
    IN: ["HINDI", "ENGLISH_UNITED_STATES", "ENGLISH_UNITED_KINGDOM"],
    // JP: ["JAPANESE", "ENGLISH_UNITED_STATES"],
    // GB: ["ENGLISH_UNITED_STATES", "ENGLISH_UNITED_KINGDOM"],
    // FR: ["FRENCH", "ENGLISH_UNITED_STATES"]
};

export const countries = ["CA", "JP", "US", "IN", "FR", "GB"];

export function generateAIModelData(): AIModel[] {
    const sampleData: AIModel[] = [];

    for (const country of countries) {
        if (names.hasOwnProperty(country)) {
            const countryNames = names[country];
            const countryLanguages = languages[country];

            for (const name of countryNames) {
                const randomIndex = Math.floor(Math.random() * countryLanguages.length);
                sampleData.push({
                    name,
                    country,
                    language: countryLanguages[randomIndex]
                });
            }
        }
    }

    return sampleData;
}

