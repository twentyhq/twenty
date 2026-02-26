# Workflow — Jak pracować na co dzień

## 1. Tworzenie nowego zadania (Issue)

1. GitHub → Issues → New Issue
2. Wybierz szablon (Feature / Bug / Technical Task)
3. Wypełnij opis, dodaj etykiety, przypisz do Project

## 2. Rozpoczęcie pracy

```bash
cd ~/TwentyCRM_SM
git checkout develop
git pull origin develop
git checkout -b feature/nazwa-funkcji
```

## 3. Praca z AI (Claude Code / Codex)

- Opisz CO chcesz osiągnąć
- Podaj kontekst: "Pracuję na branch-u feature/nazwa"
- Poproś o wyjaśnienie zmian zanim je zatwierdzisz

## 4. Commitowanie

```bash
git status                           # Co się zmieniło?
git add .                            # Dodaj zmiany
git status                           # SPRAWDŹ czy nie ma .env!
git commit -m "feat: opis zmiany"    # Commit
git push origin feature/nazwa        # Push na GitHub
```

## 5. Testowanie na DEV

```bash
cd ~/TwentyCRM_SM
git checkout feature/nazwa-funkcji
git pull
docker compose down && docker compose up -d
docker compose logs -f
```

Otwórz https://toniedevcrm.salesmasters.pl i przetestuj.

## 6. Pull Request i merge

1. GitHub → Pull Requests → New Pull Request
2. Base: develop ← Compare: feature/nazwa
3. Opisz zmiany → Merge

## 7. Deploy na produkcję

⚠️ ZAWSZE testuj na DEV!

1. Merge develop → main (Pull Request)
2. Na serwerze produkcyjnym:
```bash
cd /opt/twenty/packages/twenty-docker
docker compose pull
docker compose down && docker compose up -d
```

## 8. Backup DEV

```bash
docker exec twenty-db-1 pg_dump -U postgres default > ~/backup_dev_$(date +%Y%m%d).sql
```

## Flow

```
Issue → Branch → Praca → Commit → Push → Test DEV → PR → Merge develop → Merge main → Deploy PROD
```
