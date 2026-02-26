# Changelog — TwentyCRM_SM

Wszystkie istotne zmiany w projekcie są dokumentowane w tym pliku.

Format: `[DATA] — Opis zmiany`

---

## 2025-02-20 — Inicjalizacja środowiska DEV

- Postawienie VPS Hetzner CX22 (Ubuntu 24.04 LTS)
- Instalacja: Docker, Docker Compose, Git, Node.js 22 LTS, Yarn
- Konfiguracja bezpieczeństwa: firewall (UFW), fail2ban, użytkownik nie-root
- Wyczyszczenie repozytorium GitHub (usunięcie submodułu, starych szkieletów)
- Stworzenie nowej struktury projektu
- Dodanie docker-compose.yml (na bazie konfiguracji produkcyjnej)
- Dodanie .env.example, .gitignore, README.md
- Dodanie CLAUDE.md i AGENTS.md (instrukcje dla narzędzi AI)
- Dodanie dokumentacji: SPEC.md, SETUP.md, WORKFLOW.md, ARCHITECTURE.md

## 2025-02-20 — Hardening DEV

- Firewall (UFW): dostęp tylko z IP biura (91.192.166.42)
- Wyłączenie logowania root przez SSH
- Nginx + SSL wildcard (*.salesmasters.pl)
